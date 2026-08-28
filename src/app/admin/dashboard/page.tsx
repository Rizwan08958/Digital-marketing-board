"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Tv,
  Megaphone,
  QrCode,
  TicketPercent,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

interface SummaryData {
  totalCompanies: number;
  totalBillboards: number;
  totalAds: number;
  activeAds: number;
  totalScans: number;
  totalClaims: number;
  totalRedemptions: number;
  claimRate: string;
  redemptionRate: string;
}

interface AdPerformance {
  id: string;
  name: string;
  companyName: string;
  billboardName: string;
  campaignCode: string;
  status: string;
  scans: number;
  claims: number;
  redemptions: number;
  claimRate: number;
  redemptionRate: number;
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [performances, setPerformances] = useState<AdPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setPerformances(data.adPerformances || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = [
    {
      title: "Total Companies",
      value: summary?.totalCompanies ?? 0,
      icon: Building2,
      color: "from-blue-600 to-indigo-600",
      sub: "Active Advertisers",
    },
    {
      title: "Total Billboards",
      value: summary?.totalBillboards ?? 0,
      icon: Tv,
      color: "from-cyan-600 to-blue-600",
      sub: "Digital Display Nodes",
    },
    {
      title: "Active Campaigns",
      value: `${summary?.activeAds ?? 0} / ${summary?.totalAds ?? 0}`,
      icon: Megaphone,
      color: "from-violet-600 to-purple-600",
      sub: "Live on Billboards",
    },
    {
      title: "Total QR Scans",
      value: summary?.totalScans.toLocaleString() ?? "0",
      icon: QrCode,
      color: "from-amber-500 to-orange-600",
      sub: "Customer Billboard Scans",
    },
    {
      title: "Coupons Claimed",
      value: summary?.totalClaims.toLocaleString() ?? "0",
      icon: TicketPercent,
      color: "from-emerald-500 to-teal-600",
      sub: `Claim Rate: ${summary?.claimRate ?? "0%"}`,
    },
    {
      title: "Coupons Redeemed",
      value: summary?.totalRedemptions.toLocaleString() ?? "0",
      icon: CheckCircle2,
      color: "from-rose-500 to-pink-600",
      sub: `Redeem Rate: ${summary?.redemptionRate ?? "0%"}`,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-slate-700/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" /> Real-time ROI Metrics
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Interactive Billboard Analytics</h2>
          <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl">
            Track customer engagement from physical billboard QR scans to shop visit redemptions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors text-slate-200"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/advertisements"
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl text-xs md:text-sm shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Advertisement</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.title}</p>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">{item.value}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{item.sub}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg shrink-0`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Conversion Funnel Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          Interactive Engagement Funnel (Scans → Claims → Redemptions)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Step 1: Billboard Awareness</span>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{summary?.totalScans ?? 0}</h4>
            <p className="text-xs text-slate-500 mt-1">Unique QR Scans from Display</p>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-amber-500 h-full w-full"></div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Step 2: Email Claims</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded">
                {summary?.claimRate ?? "0%"} Conversion
              </span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{summary?.totalClaims ?? 0}</h4>
            <p className="text-xs text-slate-500 mt-1">Verified Customers with Coupon</p>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: summary?.claimRate || "0%" }}
              ></div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Step 3: Shop Redemptions</span>
              <span className="text-xs font-bold text-rose-600 bg-rose-100/70 px-2 py-0.5 rounded">
                {summary?.redemptionRate ?? "0%"} Conversion
              </span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{summary?.totalRedemptions ?? 0}</h4>
            <p className="text-xs text-slate-500 mt-1">Actual In-Store Footfall Customers</p>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: summary?.redemptionRate || "0%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Active Campaigns Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Campaign Performance Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live performance across digital billboard network</p>
          </div>
          <Link
            href="/admin/advertisements"
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <span>View All Campaigns</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Campaign & Company</th>
                <th className="px-6 py-3.5">Billboard Location</th>
                <th className="px-6 py-3.5 text-center">QR Scans</th>
                <th className="px-6 py-3.5 text-center">Claims</th>
                <th className="px-6 py-3.5 text-center">Redeemed</th>
                <th className="px-6 py-3.5 text-center">Claim Rate</th>
                <th className="px-6 py-3.5 text-center">Redeem Rate</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {performances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No advertisements created yet. Click "New Advertisement" to generate your first QR campaign!
                  </td>
                </tr>
              ) : (
                performances.map((perf) => (
                  <tr key={perf.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{perf.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-cyan-600 font-mono font-semibold">{perf.campaignCode}</span>
                        <span>•</span>
                        <span>{perf.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{perf.billboardName}</td>
                    <td className="px-6 py-4 text-center font-bold text-amber-600">{perf.scans}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600">{perf.claims}</td>
                    <td className="px-6 py-4 text-center font-bold text-rose-600">{perf.redemptions}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{perf.claimRate}%</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{perf.redemptionRate}%</td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          perf.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {perf.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
