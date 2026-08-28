import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCouponCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { email, campaignCode, otpCode, token } = await req.json();

    if (!email || !campaignCode || (!otpCode && !token)) {
      return NextResponse.json({ error: "Missing verification credentials" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Fetch Campaign & Ad
    const campaign = await prisma.campaign.findUnique({
      where: { campaignCode },
      include: {
        advertisement: {
          include: { company: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const ad = campaign.advertisement;
    if (ad.status !== "ACTIVE") {
      return NextResponse.json({ error: "This campaign is not active" }, { status: 400 });
    }

    if (new Date(ad.endDate) < new Date()) {
      return NextResponse.json({ error: "This campaign has expired" }, { status: 400 });
    }

    // 2. Validate OTP / Token
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email: cleanEmail,
        campaignId: campaign.id,
        ...(otpCode ? { otpCode: otpCode.trim() } : { token }),
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Mark verified
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    // 3. Upsert Customer
    const customer = await prisma.customer.upsert({
      where: { email: cleanEmail },
      update: {},
      create: { email: cleanEmail },
    });

    // 4. Double check constraint: One email can claim ONE coupon per campaign
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        campaignId_customerId: {
          campaignId: campaign.id,
          customerId: customer.id,
        },
      },
    });

    if (existingCoupon) {
      return NextResponse.json({
        success: true,
        alreadyClaimed: true,
        coupon: existingCoupon,
        message: "You already have a coupon for this campaign.",
      });
    }

    // Check limit
    if (ad.couponLimit) {
      const claimedCount = await prisma.coupon.count({
        where: { campaignId: campaign.id },
      });
      if (claimedCount >= ad.couponLimit) {
        return NextResponse.json({ error: "Coupon limit reached for this campaign" }, { status: 400 });
      }
    }

    // 5. Generate Unique Coupon Code
    let couponCode = generateCouponCode();
    while (await prisma.coupon.findUnique({ where: { couponCode } })) {
      couponCode = generateCouponCode();
    }

    // 6. Create Coupon atomically
    const coupon = await prisma.coupon.create({
      data: {
        couponCode,
        campaignId: campaign.id,
        customerId: customer.id,
        expiresAt: new Date(ad.endDate),
        status: "ACTIVE",
      },
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
      },
    });

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        couponCode: coupon.couponCode,
        status: coupon.status,
        expiresAt: coupon.expiresAt,
        claimedAt: coupon.claimedAt,
        offerTitle: coupon.campaign.advertisement.offerTitle,
        discountDescription: coupon.campaign.advertisement.discountDescription,
        companyName: coupon.campaign.advertisement.company.name,
        shopAddress: coupon.campaign.advertisement.company.shopAddress,
        customerEmail: coupon.customer.email,
      },
    });
  } catch (error) {
    console.error("Coupon claim error:", error);
    return NextResponse.json({ error: "Failed to claim coupon" }, { status: 500 });
  }
}
