import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { couponCode, shopStaffIdentifier, notes } = await req.json();

    if (!couponCode) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = couponCode.toUpperCase().trim();

    // Atomic transaction to avoid double redemptions
    const result = await prisma.$transaction(async (tx) => {
      const coupon = await tx.coupon.findUnique({
        where: { couponCode: cleanCode },
        include: {
          campaign: {
            include: {
              advertisement: {
                include: { company: true },
              },
            },
          },
          customer: true,
          redemption: true,
        },
      });

      if (!coupon) {
        throw new Error("NOT_FOUND");
      }

      if (coupon.status === "REDEEMED" || coupon.redemption) {
        throw new Error("ALREADY_REDEEMED");
      }

      if (coupon.status === "CANCELLED") {
        throw new Error("CANCELLED");
      }

      if (new Date(coupon.expiresAt) < new Date() || coupon.status === "EXPIRED") {
        throw new Error("EXPIRED");
      }

      // Mark Coupon as REDEEMED
      const updatedCoupon = await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          status: "REDEEMED",
          redemption: {
            create: {
              shopStaffIdentifier: shopStaffIdentifier || "Shop Staff",
              notes: notes || null,
            },
          },
        },
        include: {
          redemption: true,
          campaign: {
            include: {
              advertisement: {
                include: { company: true },
              },
            },
          },
        },
      });

      return updatedCoupon;
    });

    return NextResponse.json({
      success: true,
      message: "Coupon successfully redeemed!",
      redemption: {
        couponCode: result.couponCode,
        redeemedAt: result.redemption?.redeemedAt,
        companyName: result.campaign.advertisement.company.name,
        offerTitle: result.campaign.advertisement.offerTitle,
        discountDescription: result.campaign.advertisement.discountDescription,
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "UNKNOWN";
    if (errMessage === "NOT_FOUND") {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    if (errMessage === "ALREADY_REDEEMED") {
      return NextResponse.json({ error: "This coupon has ALREADY been redeemed and cannot be used again!" }, { status: 400 });
    }
    if (errMessage === "EXPIRED") {
      return NextResponse.json({ error: "Cannot redeem: This coupon has expired!" }, { status: 400 });
    }
    if (errMessage === "CANCELLED") {
      return NextResponse.json({ error: "Cannot redeem: This coupon was cancelled" }, { status: 400 });
    }

    console.error("Redemption error:", error);
    return NextResponse.json({ error: "Failed to redeem coupon" }, { status: 500 });
  }
}
