"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import {
  TicketPercent,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Tv,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { formatDate, formatDateTime } from "@/lib/utils";

interface CouponDetail {
  id: string;
  couponCode: string;
  status: "ACTIVE" | "REDEEMED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
  claimedAt: string;
  offerTitle: string;
  discountDescription: string;
  companyName: string;
  shopAddress: string;
  customerEmail: string;
  redemption?: {
    redeemedAt: string;
    shopStaffIdentifier: string | null;
  } | null;
}

export default function MobileCouponPage() {
  const params = useParams();
  const couponCode = (params.couponCode as string)?.toUpperCase();

  const [coupon, setCoupon] = useState<CouponDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchCoupon() {
      try {
        setLoading(true);
        const res = await fetch(`/api/coupons?code=${couponCode}`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.coupon) {
          setError(data.error || "Coupon not found");
          setLoading(false);
          return;
        }

        setCoupon(data.coupon);

        // Generate QR containing coupon redemption code for shop staff scanner
        const qrUrl = `${window.location.origin}/shop/redeem/${data.coupon.couponCode}`;
        const dataUrl = await QRCode.toDataURL(qrUrl, {
          width: 500,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });
        setQrDataUrl(dataUrl);

        // Fire celebration confetti on initial reveal
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        setError("Failed to load coupon details");
      } finally {
        setLoading(false);
      }
    }

    if (couponCode) {
      fetchCoupon();
    }
  }, [couponCode]);

  const handleCopyCode = () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center text-white">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-base font-bold">Unlocking Your Exclusive Coupon...</h2>
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Coupon Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">{error || "Invalid coupon code."}</p>
      </div>
    );
  }

  const isRedeemed = coupon.status === "REDEEMED";
  const isExpired = coupon.status === "EXPIRED";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-cyan-500 selection:text-slate-950">
      <div className="w-full max-w-md mx-auto my-auto space-y-5">
        {/* Top Celebration Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-700/50 rounded-full text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Coupon Successfully Unlocked!</span>
          </div>
          <h1 className="text-xs text-slate-400 font-medium">Show this screen at the shop checkout counter</h1>
        </div>

        {/* Mobile Coupon Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`rounded-3xl border shadow-2xl overflow-hidden relative ${
            isRedeemed
              ? "bg-slate-900 border-purple-500/40"
              : isExpired
              ? "bg-slate-900 border-slate-700 opacity-75"
              : "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-cyan-500/50"
          }`}
        >
          {/* Status Ribbon */}
          <div
            className={`py-2 px-4 text-center font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 ${
              isRedeemed
                ? "bg-purple-900/80 text-purple-200"
                : isExpired
                ? "bg-slate-800 text-slate-400"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            }`}
          >
            {isRedeemed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Coupon Redeemed</span>
              </>
            ) : isExpired ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Offer Expired</span>
              </>
            ) : (
              <>
                <TicketPercent className="w-4 h-4" />
                <span>Active & Ready to Redeem</span>
              </>
            )}
          </div>

          <div className="p-6 text-center">
            {/* Company & Offer Header */}
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{coupon.companyName}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{coupon.offerTitle}</h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{coupon.discountDescription}</p>

            {/* Shop Redemption QR Code */}
            <div className="my-5 p-4 bg-white rounded-2xl inline-block shadow-xl relative">
              {qrDataUrl ? (
                <div className="relative">
                  <img
                    src={qrDataUrl}
                    alt="Redemption QR"
                    className={`w-52 h-52 mx-auto ${isRedeemed ? "grayscale opacity-25" : ""}`}
                  />
                  {isRedeemed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-950 font-black text-lg bg-white/80 rounded-xl">
                      <CheckCircle2 className="w-10 h-10 text-purple-700 mb-1" />
                      <span>REDEEMED</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {formatDateTime(coupon.redemption?.redeemedAt || new Date())}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-52 h-52 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Coupon Code Block with Copy */}
            <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-2xl p-3 max-w-xs mx-auto mb-4">
              <div className="text-left pl-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Coupon Code</span>
                <span className="text-lg font-black font-mono tracking-wider text-cyan-400">{coupon.couponCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Location & Instructions */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300">Shop Address:</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{coupon.shopAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Valid Until: {formatDate(coupon.expiresAt)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Helper Info */}
        <div className="text-center text-[11px] text-slate-500">
          Coupon registered to: <span className="text-slate-300 font-medium">{coupon.customerEmail}</span>
        </div>
      </div>

      <footer className="p-4 text-center text-[11px] text-slate-600">
        iSquare Bill Boards • Digital Ad Voucher Network
      </footer>
    </div>
  );
}
