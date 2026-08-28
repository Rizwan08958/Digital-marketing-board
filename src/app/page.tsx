import Link from "next/link";
import {
  QrCode,
  Tv,
  TicketPercent,
  ScanLine,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation */}
      <header className="border-b border-slate-800/80 px-6 py-4 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg text-white">iSquare</span>
              <span className="text-cyan-400 font-light ml-1 text-sm uppercase tracking-wider">Bill Boards</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop/verify"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition-colors"
            >
              <ScanLine className="w-4 h-4 text-cyan-400" />
              <span>Shop Staff POS</span>
            </Link>
            <Link
              href="/admin/login"
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center relative z-10 space-y-12">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cyan-950/80 border border-cyan-700/60 rounded-full text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Digital Outdoor Billboard QR Coupon Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
            Transform Billboard Ads Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Measurable Footfall</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Connect high-visibility digital billboard displays with instant mobile discount coupons and verified shop redemptions.
          </p>
        </div>

        {/* 3 Step Interactive Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Step 1 */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm group hover:border-cyan-500/50 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <Tv className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">1. Video QR Display</span>
            <h3 className="text-lg font-bold text-white mt-1">Unique QR Per Ad</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every billboard campaign generates a dedicated high-res QR asset seamlessly placed into the broadcast video.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm group hover:border-emerald-500/50 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <TicketPercent className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">2. Mobile Claim</span>
            <h3 className="text-lg font-bold text-white mt-1">1 Email = 1 Coupon</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Passersby scan the billboard, verify email with instant OTP, and reveal a mobile coupon card right on their phones.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm group hover:border-rose-500/50 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">3. Shop POS & ROI</span>
            <h3 className="text-lg font-bold text-white mt-1">Atomic In-Store POS</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Store staff validates and redeems the voucher with one tap. Advertisers see real-time ROI: Scans → Claims → Redemptions.
            </p>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link
            href="/c/CAMP-001"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Test Customer Scan Flow (/c/CAMP-001)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/admin/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Open Admin Dashboard</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        © 2026 iSquare Bill Boards • Digital Billboard QR Marketing Platform
      </footer>
    </div>
  );
}

