import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";
import { generateCampaignCode } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const advertisement = await prisma.advertisement.findUnique({
        where: { id },
        include: {
          company: true,
          billboard: true,
          campaign: {
            include: {
              _count: {
                select: {
                  scans: true,
                  coupons: true,
                },
              },
            },
          },
        },
      });

      if (!advertisement) {
        return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
      }

      // Count redemptions
      let redemptionCount = 0;
      if (advertisement.campaign) {
        redemptionCount = await prisma.couponRedemption.count({
          where: { coupon: { campaignId: advertisement.campaign.id } },
        });
      }

      return NextResponse.json({
        success: true,
        advertisement: {
          ...advertisement,
          stats: {
            scans: advertisement.campaign?._count.scans || 0,
            claims: advertisement.campaign?._count.coupons || 0,
            redemptions: redemptionCount,
          },
        },
      });
    }

    const advertisements = await prisma.advertisement.findMany({
      include: {
        company: true,
        billboard: true,
        campaign: {
          include: {
            _count: {
              select: {
                scans: true,
                coupons: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Batch fetch redemptions per campaign
    const adsWithStats = await Promise.all(
      advertisements.map(async (ad) => {
        let redemptionCount = 0;
        if (ad.campaign) {
          redemptionCount = await prisma.couponRedemption.count({
            where: { coupon: { campaignId: ad.campaign.id } },
          });
        }
        return {
          ...ad,
          stats: {
            scans: ad.campaign?._count.scans || 0,
            claims: ad.campaign?._count.coupons || 0,
            redemptions: redemptionCount,
          },
        };
      })
    );

    return NextResponse.json({ success: true, advertisements: adsWithStats });
  } catch (error) {
    console.error("Fetch advertisements error:", error);
    return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      companyId,
      billboardId,
      name,
      offerTitle,
      discountDescription,
      couponLimit,
      startDate,
      endDate,
      status,
    } = await req.json();

    if (!companyId || !billboardId || !name || !offerTitle || !discountDescription || !startDate || !endDate) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 });
    }

    // Auto generate next unique campaign code
    const totalCampaigns = await prisma.campaign.count();
    let nextIndex = totalCampaigns + 1;
    let campaignCode = generateCampaignCode(nextIndex);

    while (await prisma.campaign.findUnique({ where: { campaignCode } })) {
      nextIndex++;
      campaignCode = generateCampaignCode(nextIndex);
    }

    // Determine best base URL: from request origin/headers or NEXT_PUBLIC_APP_URL
    const reqOrigin = req.headers.get("origin") || req.headers.get("referer");
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (reqOrigin) {
      try {
        const u = new URL(reqOrigin);
        baseUrl = `${u.protocol}//${u.host}`;
      } catch {}
    } else {
      const host = req.headers.get("host");
      if (host) {
        baseUrl = `http://${host}`;
      }
    }
    const qrUrl = `${baseUrl}/c/${campaignCode}`;

    // Create Advertisement & 1:1 Campaign transactionally
    const ad = await prisma.advertisement.create({
      data: {
        companyId,
        billboardId,
        name,
        offerTitle,
        discountDescription,
        couponLimit: couponLimit ? parseInt(couponLimit) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || "ACTIVE",
        campaign: {
          create: {
            campaignCode,
            qrUrl,
          },
        },
      },
      include: {
        company: true,
        billboard: true,
        campaign: true,
      },
    });

    return NextResponse.json({ success: true, advertisement: ad });
  } catch (error) {
    console.error("Create advertisement error:", error);
    return NextResponse.json({ error: "Failed to create advertisement" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id,
      companyId,
      billboardId,
      name,
      offerTitle,
      discountDescription,
      couponLimit,
      startDate,
      endDate,
      status,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Advertisement ID required" }, { status: 400 });
    }

    const ad = await prisma.advertisement.update({
      where: { id },
      data: {
        ...(companyId && { companyId }),
        ...(billboardId && { billboardId }),
        ...(name && { name }),
        ...(offerTitle && { offerTitle }),
        ...(discountDescription && { discountDescription }),
        ...(couponLimit !== undefined && { couponLimit: couponLimit ? parseInt(couponLimit) : null }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
      },
      include: {
        company: true,
        billboard: true,
        campaign: true,
      },
    });

    return NextResponse.json({ success: true, advertisement: ad });
  } catch (error) {
    console.error("Update advertisement error:", error);
    return NextResponse.json({ error: "Failed to update advertisement" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Advertisement ID required" }, { status: 400 });
    }

    await prisma.advertisement.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Advertisement deleted" });
  } catch (error) {
    console.error("Delete advertisement error:", error);
    return NextResponse.json({ error: "Failed to delete advertisement" }, { status: 500 });
  }
}
