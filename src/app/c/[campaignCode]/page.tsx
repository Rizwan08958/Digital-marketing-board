"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Clock,
  TicketPercent,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

interface CampaignData {
  id: string;
  campaignCode: string;
  advertisement: {
    id: string;
    name: string;
    offerTitle: string;
    discountDescription: string;
    startDate: string;
    endDate: string;
    status: string;
    companyName: string;
    shopAddress: string;
    billboardName: string;
    billboardLocation: string;
  };
}

export default function CustomerCampaignPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const campaignCode = (params.campaignCode as string)?.toUpperCase();
  const urlToken = searchParams.get("token");
  const urlEmail = searchParams.get("email");

  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [campaignError, setCampaignError] = useState("");

  // Email & OTP states
  const [email, setEmail] = useState(urlEmail || "");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"ENTER_EMAIL" | "VERIFY_OTP" | "SUCCESS">("ENTER_EMAIL");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // 1. Log anonymous scan and load ad info
  useEffect(() => {
    async function recordScanAndFetch() {
      try {
        setLoadingCampaign(true);
        const res = await fetch("/api/scans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignCode }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setCampaignError(data.error || "This billboard promotion is no longer available.");
          setLoadingCampaign(false);
          return;
        }

        setCampaign(data.campaign);

        // If user came via magic link with valid token & email, automatically claim!
        if (urlToken && urlEmail) {
          autoClaimWithToken(urlEmail, urlToken);
        }
      } catch {
        setCampaignError("Unable to connect to billboard server.");
      } finally {
        setLoadingCampaign(false);
      }
    }

    if (campaignCode) {
      recordScanAndFetch();
    }
  }, [campaignCode]);

  // Auto claim if magic link is clicked
  const autoClaimWithToken = async (emailToVerify: string, tokenToVerify: string) => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/coupons/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToVerify,
          campaignCode,
          token: tokenToVerify,
        }),
      });

      const data = await res.json();
      if (data.success && data.coupon) {
        router.push(`/coupon/${data.coupon.couponCode}`);
      } else {
        setErrorMsg(data.error || "Verification link expired. Please enter email again.");
        setStep("ENTER_EMAIL");
      }
    } catch {
      setErrorMsg("Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1: Send OTP to Email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/coupons/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, campaignCode }),
      });

      const data = await res.json();

      if (data.alreadyClaimed) {
        // Redirect directly to existing coupon
        router.push(`/coupon/${data.couponCode}`);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to process email");
        setSubmitting(false);
        return;
      }

      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
      }

      setStep("VERIFY_OTP");
    } catch {
      setErrorMsg("Failed to connect. Please check your network.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Claim Coupon
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/coupons/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          campaignCode,
          otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Invalid verification code");
        setSubmitting(false);
        return;
      }

      // Navigate to full coupon screen
      router.push(`/coupon/${data.coupon.couponCode}`);
    } catch {
      setErrorMsg("Failed to claim coupon");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCampaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center text-white">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-base font-bold">Scanning Billboard Offer...</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to iSquare digital billboard...</p>
      </div>
    );
  }

  if (campaignError || !campaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Offer Unavailable</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
          {campaignError || "This campaign is no longer active or the billboard QR code has expired."}
        </p>
      </div>
    );
  }

  const ad = campaign.advertisement;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Background radial accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-72 bg-gradient-to-b from-cyan-500/15 via-blue-500/5 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex-1 flex flex-col justify-center">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-700/50 rounded-full text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Digital Billboard Exclusive</span>
          </div>
          <h1 className="text-xs uppercase tracking-widest text-slate-400 font-semibold">{ad.billboardName}</h1>
        </div>

        {/* Big Offer Banner Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Top highlight glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="text-center">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{ad.companyName}</span>
            <h2 className="text-3xl font-black text-amber-400 tracking-tight mt-1">{ad.offerTitle}</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{ad.discountDescription}</p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{ad.shopAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Valid until: {formatDate(ad.endDate)}</span>
            </div>
          </div>
        </motion.div>

        {/* Claim Form Section */}
        <div className="mt-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === "ENTER_EMAIL" ? (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendEmail}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">Enter Your Email</label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    We'll send a 6-digit code to verify your coupon claim. No account needed!
                  </p>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Get My Coupon</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-200">Enter 6-Digit Code</label>
                    <button
                      type="button"
                      onClick={() => setStep("ENTER_EMAIL")}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">Code sent to: {email}</p>

                  {/* Dev Helper Hint */}
                  {devOtpHint && (
                    <div className="p-2 mb-2 bg-cyan-950/80 border border-cyan-700/60 rounded-lg text-[11px] text-cyan-300 text-center">
                      Dev OTP code: <span className="font-mono font-bold text-white text-sm">{devOtpHint}</span>
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="••••••"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full py-3 text-center tracking-[8px] font-mono text-xl font-bold bg-slate-950/70 border border-slate-800 rounded-xl text-cyan-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || otpCode.length < 6}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Coupon...</span>
                    </>
                  ) : (
                    <>
                      <TicketPercent className="w-4 h-4" />
                      <span>Unlock My Coupon Code</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Security / 1 email rule disclaimer */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> One coupon per verified email per advertisement
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="p-4 text-center text-[11px] text-slate-600">
        Powered by <span className="text-slate-400 font-semibold">iSquare Bill Boards</span> • Outdoor Digital Ad Network
      </footer>
    </div>
  );
}
