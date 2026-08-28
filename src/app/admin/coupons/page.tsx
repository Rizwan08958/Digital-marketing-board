"use client";

import { useEffect, useState } from "react";
import { TicketPercent, Search, CheckCircle2, Clock, XCircle, Building2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface CouponRecord {
  id: string;
  couponCode: string;
  status: "ACTIVE" | "REDEEMED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
  claimedAt: string;
  campaign: {
    campaignCode: string;
    advertisement: {
      name: string;
      offerTitle: string;
      company: { name: string };
    };
  };
  customer: {
    email: string;
  };
  redemption?: {
    redeemedAt: string;
    shopStaffIdentifier: string | null;
  };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function fetchCoupons() {
      try {
        setLoading(true);
        const res = await fetch("/api/coupons");
        const data = await res.json();
        if (data.success) {
          setCoupons(data.coupons || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, []);

  const filtered = coupons.filter((c) => {
    const matchesSearch =
      c.couponCode.toLowerCase().includes(search.toLowerCase()) ||
      c.customer.email.toLowerCase().includes(search.toLowerCase()) ||
      c.campaign.advertisement.company.name.toLowerCase().includes(search.toLowerCase()) ||
      c.campaign.campaignCode.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Coupons & Claims</h2>
        <p className="text-xs text-slate-500 mt-1">
          Master registry of all generated discount coupons, claim logs, and store redemptions
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center gap-2 w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Coupon Code (ISQ-XXX), Customer Email, Company..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="REDEEMED">REDEEMED</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Customer Email</th>
                <th className="px-6 py-4">Offer & Company</th>
                <th className="px-6 py-4">Claimed At</th>
                <th className="px-6 py-4">Redeemed At</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No coupons matched your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-black text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                        {c.couponCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{c.customer.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-amber-700">{c.campaign.advertisement.offerTitle}</span>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        <span>{c.campaign.advertisement.company.name}</span>
                        <span>•</span>
                        <span className="font-mono text-cyan-600">{c.campaign.campaignCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDateTime(c.claimedAt)}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.redemption ? (
                        <div className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{formatDateTime(c.redemption.redeemedAt)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Not redeemed yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : c.status === "REDEEMED"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.status}
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
