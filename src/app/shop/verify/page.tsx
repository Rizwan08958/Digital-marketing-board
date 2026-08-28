"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ScanLine,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

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

export default function ShopVerifyPage() {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/shop/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        valid: false,
        status: "NOT_FOUND",
        message: "Failed to connect to verification server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToRedeem = () => {
    if (result?.coupon?.couponCode) {
      router.push(`/shop/redeem/${result.coupon.couponCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto my-auto space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mx-auto mb-3">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Shop Coupon Verification POS</h1>
          <p className="text-xs text-slate-400 mt-1">iSquare Billboards Merchant Staff Terminal</p>
        </div>

        {/* Input Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Enter Customer Coupon Code</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. ISQ-A82K91"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-center font-mono font-bold tracking-widest text-lg text-cyan-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !couponCode.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Coupon...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Validate Coupon</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`rounded-3xl border p-6 shadow-2xl ${
                result.valid
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-100"
                  : result.status === "REDEEMED"
                  ? "bg-purple-950/40 border-purple-500/50 text-purple-100"
                  : "bg-rose-950/40 border-rose-500/50 text-rose-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    result.valid
                      ? "bg-emerald-500/20 text-emerald-400"
                      : result.status === "REDEEMED"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {result.valid ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : result.status === "REDEEMED" ? (
                    <Clock className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-base leading-tight">
                    {result.valid
                      ? "VALID COUPON"
                      : result.status === "REDEEMED"
                      ? "ALREADY REDEEMED"
                      : result.status === "EXPIRED"
                      ? "COUPON EXPIRED"
                      : "INVALID COUPON"}
                  </h3>
                  <p className="text-xs mt-1 opacity-90">{result.message}</p>
                </div>
              </div>

              {/* Offer Details if coupon exists */}
              {result.coupon && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-70">Company:</span>
                    <span className="font-bold">{result.coupon.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Offer:</span>
                    <span className="font-bold text-amber-400">{result.coupon.offerTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Customer:</span>
                    <span className="font-mono">{result.coupon.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Expires:</span>
                    <span>{formatDate(result.coupon.expiresAt)}</span>
                  </div>

                  {result.valid && (
                    <div className="pt-3">
                      <button
                        onClick={handleProceedToRedeem}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>Proceed to Redeem Coupon</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="p-4 text-center text-[11px] text-slate-600">
        iSquare Bill Boards • Secure In-Store Redemption Node
      </footer>
    </div>
  );
}
