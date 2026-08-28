import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const advertisementId = searchParams.get("advertisementId");

    // If requesting single advertisement analytics
    if (advertisementId) {
      const ad = await prisma.advertisement.findUnique({
        where: { id: advertisementId },
        include: {
          company: true,
          billboard: true,
          campaign: {
            include: {
              scans: { orderBy: { scannedAt: "asc" } },
              coupons: {
                include: { redemption: true, customer: true },
                orderBy: { claimedAt: "asc" },
              },
            },
          },
        },
      });

      if (!ad || !ad.campaign) {
        return NextResponse.json({ error: "Advertisement or campaign not found" }, { status: 404 });
      }

      const totalScans = ad.campaign.scans.length;
      const totalClaims = ad.campaign.coupons.length;
      const totalRedemptions = ad.campaign.coupons.filter((c) => c.status === "REDEEMED").length;
      const activeCoupons = ad.campaign.coupons.filter((c) => c.status === "ACTIVE").length;
      const expiredCoupons = ad.campaign.coupons.filter(
        (c) => c.status === "EXPIRED" || (c.status === "ACTIVE" && new Date(c.expiresAt) < new Date())
      ).length;

      const claimRate = totalScans > 0 ? ((totalClaims / totalScans) * 100).toFixed(1) : "0.0";
      const redemptionRate = totalClaims > 0 ? ((totalRedemptions / totalClaims) * 100).toFixed(1) : "0.0";

      // Timeline chart data group by day
      const dailyMap: { [date: string]: { date: string; scans: number; claims: number; redemptions: number } } = {};

      ad.campaign.scans.forEach((s) => {
        const d = s.scannedAt.toISOString().split("T")[0];
        if (!dailyMap[d]) dailyMap[d] = { date: d, scans: 0, claims: 0, redemptions: 0 };
        dailyMap[d].scans++;
      });

      ad.campaign.coupons.forEach((c) => {
        const d = c.claimedAt.toISOString().split("T")[0];
        if (!dailyMap[d]) dailyMap[d] = { date: d, scans: 0, claims: 0, redemptions: 0 };
        dailyMap[d].claims++;
        if (c.redemption) {
          const rd = c.redemption.redeemedAt.toISOString().split("T")[0];
          if (!dailyMap[rd]) dailyMap[rd] = { date: rd, scans: 0, claims: 0, redemptions: 0 };
          dailyMap[rd].redemptions++;
        }
      });

      const timeline = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

      return NextResponse.json({
        success: true,
        advertisement: {
          id: ad.id,
          name: ad.name,
          offerTitle: ad.offerTitle,
          discountDescription: ad.discountDescription,
          startDate: ad.startDate,
          endDate: ad.endDate,
          status: ad.status,
          company: ad.company,
          billboard: ad.billboard,
          campaignCode: ad.campaign.campaignCode,
          qrUrl: ad.campaign.qrUrl,
        },
        kpis: {
          totalScans,
          totalClaims,
          totalRedemptions,
          activeCoupons,
          expiredCoupons,
          claimRate: `${claimRate}%`,
          redemptionRate: `${redemptionRate}%`,
        },
        timeline,
        recentCoupons: ad.campaign.coupons.slice(-15).map((c) => ({
          couponCode: c.couponCode,
          customerEmail: c.customer.email,
          claimedAt: c.claimedAt,
          status: c.status,
          redeemedAt: c.redemption?.redeemedAt,
        })),
      });
    }

    // High level Global Dashboard Analytics
    const [
      totalCompanies,
      totalBillboards,
      totalAds,
      activeAds,
      totalScans,
      totalClaims,
      totalRedemptions,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.billboard.count(),
      prisma.advertisement.count(),
      prisma.advertisement.count({ where: { status: "ACTIVE" } }),
      prisma.qRScan.count(),
      prisma.coupon.count(),
      prisma.couponRedemption.count(),
    ]);

    const claimRate = totalScans > 0 ? ((totalClaims / totalScans) * 100).toFixed(1) : "0.0";
    const redemptionRate = totalClaims > 0 ? ((totalRedemptions / totalClaims) * 100).toFixed(1) : "0.0";

    // Recent top campaigns breakdown
    const advertisements = await prisma.advertisement.findMany({
      include: {
        company: true,
        billboard: true,
        campaign: {
          include: {
            _count: {
              select: { scans: true, coupons: true },
            },
          },
        },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    const adPerformances = await Promise.all(
      advertisements.map(async (ad) => {
        let redemptions = 0;
        if (ad.campaign) {
          redemptions = await prisma.couponRedemption.count({
            where: { coupon: { campaignId: ad.campaign.id } },
          });
        }
        const scans = ad.campaign?._count.scans || 0;
        const claims = ad.campaign?._count.coupons || 0;
        return {
          id: ad.id,
          name: ad.name,
          companyName: ad.company.name,
          billboardName: ad.billboard.name,
          campaignCode: ad.campaign?.campaignCode,
          status: ad.status,
          scans,
          claims,
          redemptions,
          claimRate: scans > 0 ? Math.round((claims / scans) * 100) : 0,
          redemptionRate: claims > 0 ? Math.round((redemptions / claims) * 100) : 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalCompanies,
        totalBillboards,
        totalAds,
        activeAds,
        totalScans,
        totalClaims,
        totalRedemptions,
        claimRate: `${claimRate}%`,
        redemptionRate: `${redemptionRate}%`,
      },
      adPerformances,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
