import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, campaignCode } = await req.json();

    if (!email || !campaignCode) {
      return NextResponse.json({ error: "Email and Campaign code are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check campaign validity
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
      return NextResponse.json({ error: `This campaign is currently ${ad.status.toLowerCase()}` }, { status: 400 });
    }

    const now = new Date();
    if (new Date(ad.endDate) < now) {
      return NextResponse.json({ error: "This campaign offer has expired" }, { status: 400 });
    }

    // Check if customer exists and has already claimed
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
      include: {
        coupons: {
          where: { campaignId: campaign.id },
        },
      },
    });

    if (existingCustomer && existingCustomer.coupons.length > 0) {
      const existingCoupon = existingCustomer.coupons[0];
      return NextResponse.json({
        alreadyClaimed: true,
        couponCode: existingCoupon.couponCode,
        message: "You have already claimed a coupon for this advertisement!",
      });
    }

    // Check coupon limit if configured
    if (ad.couponLimit) {
      const claimedCount = await prisma.coupon.count({
        where: { campaignId: campaign.id },
      });
      if (claimedCount >= ad.couponLimit) {
        return NextResponse.json({ error: "Sorry, all coupons for this offer have been claimed" }, { status: 400 });
      }
    }

    // Generate 6-digit OTP & secure token
    const otpCode = generateOTP();
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Upsert or create verification record
    await prisma.emailVerification.create({
      data: {
        email: cleanEmail,
        otpCode,
        token,
        campaignId: campaign.id,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const magicLink = `${appUrl}/c/${campaignCode}?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    // Send email (or logs to console if no Resend key in dev)
    await sendVerificationEmail({
      to: cleanEmail,
      otpCode,
      magicLink,
      offerTitle: ad.offerTitle,
      companyName: ad.company.name,
    });

    const hasRealEmail = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "");

    return NextResponse.json({
      success: true,
      message: hasRealEmail
        ? "Verification code sent to your email"
        : "Verification code generated! Enter the code below to claim your coupon.",
      expiresInMinutes: 15,
      // If Resend API key is not configured, show code directly on UI for instant testing
      ...(!hasRealEmail && { devOtp: otpCode }),
    });
  } catch (error) {
    console.error("Email verification request error:", error);
    return NextResponse.json({ error: "Failed to process email verification" }, { status: 500 });
  }
}
