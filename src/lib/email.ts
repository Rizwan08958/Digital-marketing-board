export interface SendEmailParams {
  to: string;
  otpCode: string;
  magicLink: string;
  offerTitle: string;
  companyName: string;
}

export async function sendVerificationEmail({
  to,
  otpCode,
  magicLink,
  offerTitle,
  companyName,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Development fallback logger
    console.log("=================================================");
    console.log(`📧 [EMAIL SIMULATION] Verification to: ${to}`);
    console.log(`🏢 Company: ${companyName}`);
    console.log(`🎁 Offer: ${offerTitle}`);
    console.log(`🔑 Verification OTP Code: [ ${otpCode} ]`);
    console.log(`🔗 Verification Direct Link: ${magicLink}`);
    console.log("=================================================");
    return { success: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "iSquare Billboards <coupons@isquarebillboards.com>",
        to: [to],
        subject: `Your Coupon Verification Code: ${otpCode} - ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin: 0;">iSquare Bill Boards</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Billboard Digital Voucher Claim</p>
            </div>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 20px;">
              <h3 style="color: #0284c7; margin: 0 0 6px 0;">${companyName}</h3>
              <p style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0;">${offerTitle}</p>
            </div>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Enter the following 6-digit verification code on your screen to generate and unlock your exclusive coupon:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0284c7; background: #e0f2fe; padding: 12px 24px; border-radius: 8px;">${otpCode}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; text-align: center;">Or click the direct verification button below:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${magicLink}" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Claim My Coupon Now</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">This code will expire in 15 minutes. If you did not request this offer, you can safely ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Resend error:", errorData);
      return { success: false, error: "Failed to send email" };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Email send exception:", err);
    return { success: false, error: "Failed to send email" };
  }
}
