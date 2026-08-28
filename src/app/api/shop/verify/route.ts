import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { couponCode } = await req.json();

    if (!couponCode) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = couponCode.toUpperCase().trim();

    const coupon = await prisma.coupon.findUnique({
      where: { couponCode: cleanCode },
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
      return NextResponse.json({
        valid: false,
        status: "NOT_FOUND",
        message: "Invalid coupon code. No such coupon exists.",
      }, { status: 404 });
    }

    // Check status
    if (coupon.status === "REDEEMED") {
      return NextResponse.json({
        valid: false,
        status: "REDEEMED",
        message: "This coupon has ALREADY been redeemed!",
        coupon: {
          couponCode: coupon.couponCode,
          offerTitle: coupon.campaign.advertisement.offerTitle,
          companyName: coupon.campaign.advertisement.company.name,
          redeemedAt: coupon.redemption?.redeemedAt,
          customerEmail: coupon.customer.email,
        },
      });
    }

    if (coupon.status === "CANCELLED") {
      return NextResponse.json({
        valid: false,
        status: "CANCELLED",
        message: "This coupon has been cancelled by administration.",
      });
    }

    if (new Date(coupon.expiresAt) < new Date() || coupon.status === "EXPIRED") {
      return NextResponse.json({
        valid: false,
        status: "EXPIRED",
        message: "This coupon has EXPIRED!",
        coupon: {
          couponCode: coupon.couponCode,
          offerTitle: coupon.campaign.advertisement.offerTitle,
          companyName: coupon.campaign.advertisement.company.name,
          expiresAt: coupon.expiresAt,
        },
      });
    }

    // Fully Valid
    return NextResponse.json({
      valid: true,
      status: "ACTIVE",
      message: "Valid coupon! Ready to be redeemed.",
      coupon: {
        id: coupon.id,
        couponCode: coupon.couponCode,
        offerTitle: coupon.campaign.advertisement.offerTitle,
        discountDescription: coupon.campaign.advertisement.discountDescription,
        companyName: coupon.campaign.advertisement.company.name,
        shopAddress: coupon.campaign.advertisement.company.shopAddress,
        customerEmail: coupon.customer.email,
        expiresAt: coupon.expiresAt,
        claimedAt: coupon.claimedAt,
      },
    });
  } catch (error) {
    console.error("Shop verify error:", error);
    return NextResponse.json({ error: "Failed to verify coupon" }, { status: 500 });
  }
}
