import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (code) {
      const coupon = await prisma.coupon.findUnique({
        where: { couponCode: code.toUpperCase().trim() },
        include: {
          campaign: {
            include: {
              advertisement: {
                include: {
                  company: true,
                  billboard: true,
                },
              },
            },
          },
          customer: true,
          redemption: true,
        },
      });

      if (!coupon) {
        return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
      }

      // Automatically flag if expired in response
      let effectiveStatus = coupon.status;
      if (coupon.status === "ACTIVE" && new Date(coupon.expiresAt) < new Date()) {
        effectiveStatus = "EXPIRED";
      }

      return NextResponse.json({
        success: true,
        coupon: {
          id: coupon.id,
          couponCode: coupon.couponCode,
          status: effectiveStatus,
          expiresAt: coupon.expiresAt,
          claimedAt: coupon.claimedAt,
          offerTitle: coupon.campaign.advertisement.offerTitle,
          discountDescription: coupon.campaign.advertisement.discountDescription,
          companyName: coupon.campaign.advertisement.company.name,
          shopAddress: coupon.campaign.advertisement.company.shopAddress,
          customerEmail: coupon.customer.email,
          redemption: coupon.redemption,
        },
      });
    }

    // Admin listing
    const coupons = await prisma.coupon.findMany({
      include: {
        campaign: {
          include: {
            advertisement: {
              include: {
                company: true,
                billboard: true,
              },
            },
          },
        },
        customer: true,
        redemption: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error("Fetch coupon error:", error);
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 });
  }
}
