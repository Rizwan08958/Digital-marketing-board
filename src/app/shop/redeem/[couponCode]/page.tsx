"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Building2,
  TicketPercent,
  Sparkles,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, formatDateTime } from "@/lib/utils";

interface VerificationResult {
  valid: boolean;
  status: "ACTIVE" | "REDEEMED" | "EXPIRED" | "CANCELLED" | "NOT_FOUND";
  message: string;
  coupon?: {
    id: string;
    couponCode: string;
    offerTitle: string;
    discountDescription: string;
    companyName: string;
    shopAddress: string;
    customerEmail: string;
    expiresAt: string;
    claimedAt: string;
  };
}

export default function ShopRedeemPage() {
  const params = useParams();
  const router = useRouter();
  const couponCode = (params.couponCode as string)?.toUpperCase();

  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [data, setData] = useState<VerificationResult | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);
  const [redeemedDetails, setRedeemedDetails] = useState<any>(null);
  const [staffName, setStaffName] = useState("Cashier 01");
  const [notes, setNotes] = useState("");

  const verifyCoupon = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/shop/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode }),
      });

      const json = await res.json();
      setData(json);
    } catch {
      setData({
        valid: false,
        status: "NOT_FOUND",
        message: "Failed to connect to verification server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (couponCode) {
      verifyCoupon();
    }
  }, [couponCode]);

  const handleRedeem = async () => {
    if (!confirm(`Are you sure you want to REDEEM coupon ${couponCode}? This action is irreversible.`)) {
      return;
    }

    try {
      setRedeeming(true);
      const res = await fetch("/api/shop/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode,
          shopStaffIdentifier: staffName,
          notes,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.error || "Failed to redeem coupon");
        verifyCoupon();
        return;
      }

      setRedemptionSuccess(true);
      setRedeemedDetails(json.redemption);
    } catch {
      alert("Network error during redemption.");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center text-white">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-base font-bold">Verifying Coupon Code {couponCode}...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-cyan-500 selection:text-slate-950">
      <div className="w-full max-w-md mx-auto my-auto space-y-5">
        {/* Back Link */}
        <button
          onClick={() => router.push("/shop/verify")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scanner</span>
        </button>

        {/* Success Screen */}
        <AnimatePresence>
          {redemptionSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-950/70 border-2 border-emerald-500 rounded-3xl p-8 text-center text-white shadow-2xl space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black">COUPON REDEEMED!</h2>
              <p className="text-xs text-emerald-200 leading-relaxed">
                The discount of <span className="font-bold text-amber-400">{redeemedDetails?.offerTitle}</span> has
                been successfully applied to the customer's bill.
              </p>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-emerald-500/30 text-xs space-y-2 text-left font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Coupon:</span>
                  <span className="font-bold text-cyan-400">{couponCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time:</span>
                  <span className="text-slate-200">{formatDateTime(redeemedDetails?.redeemedAt || new Date())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Staff:</span>
                  <span className="text-slate-200">{staffName}</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/shop/verify")}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
              >
                Scan Next Customer Coupon
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="text-center pb-4 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {data?.coupon?.companyName || "Merchant Partner"}
                </span>
                <h1 className="text-2xl font-black text-white mt-1">Redemption Checkout</h1>
                <span className="font-mono text-cyan-400 font-bold text-sm bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/80 inline-block mt-2">
                  {couponCode}
                </span>
              </div>

              {/* Status Notice */}
              {!data?.valid && (
                <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-rose-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-200">Cannot Redeem Coupon</h4>
                    <p className="mt-0.5 opacity-90">{data?.message}</p>
                  </div>
                </div>
              )}

              {/* Coupon Detail Box */}
              {data?.coupon && (
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Offer Title:</span>
                    <span className="font-bold text-amber-400 text-sm">{data.coupon.offerTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Terms:</span>
                    <span className="text-slate-300 text-right max-w-[200px]">{data.coupon.discountDescription}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Customer:</span>
                    <span className="font-mono text-slate-300">{data.coupon.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expires:</span>
                    <span className="text-slate-300">{formatDate(data.coupon.expiresAt)}</span>
                  </div>
                </div>
              )}

              {/* Staff Input Form */}
              {data?.valid && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Staff Member Name / ID
                    </label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Bill / Invoice Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INV-9042"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <button
                    onClick={handleRedeem}
                    disabled={redeeming}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
                  >
                    {redeeming ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Instant Redemption...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>CONFIRM & REDEEM COUPON</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="p-4 text-center text-[11px] text-slate-600">
        iSquare Bill Boards • Merchant Checkout Node
      </footer>
    </div>
  );
}
