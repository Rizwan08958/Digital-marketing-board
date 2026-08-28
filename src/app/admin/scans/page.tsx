"use client";

import { useEffect, useState } from "react";
import { ScanLine, Search, RefreshCw, Tv, Building2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface ScanRecord {
  id: string;
  ipHash: string | null;
  userAgent: string | null;
  scannedAt: string;
  campaign: {
    campaignCode: string;
    advertisement: {
      name: string;
      offerTitle: string;
      company: { name: string };
      billboard: { name: string; code: string; location: string };
    };
  };
}

export default function AdminScansPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchScans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/scans");
      const data = await res.json();
      if (data.success) {
        setScans(data.scans || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const filtered = scans.filter(
    (s) =>
      s.campaign.campaignCode.toLowerCase().includes(search.toLowerCase()) ||
      s.campaign.advertisement.company.name.toLowerCase().includes(search.toLowerCase()) ||
      s.campaign.advertisement.billboard.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Billboard Scans</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feed of viewers pointing phone cameras at iSquare billboards
          </p>
        </div>
        <button
          onClick={fetchScans}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-sm transition-colors"
          title="Refresh Scan Feed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Campaign Code (CAMP-001), Company, or Billboard..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Scan Time</th>
                <th className="px-6 py-4">Campaign Code</th>
                <th className="px-6 py-4">Billboard Display Node</th>
                <th className="px-6 py-4">Company & Offer</th>
                <th className="px-6 py-4 text-right">Device/IP Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No scan events logged yet. Scans will stream in as users scan billboard QR codes.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatDateTime(s.scannedAt)}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        {s.campaign.campaignCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-slate-400" />
                        {s.campaign.advertisement.billboard.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {s.campaign.advertisement.billboard.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-amber-700">{s.campaign.advertisement.offerTitle}</span>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {s.campaign.advertisement.company.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {s.ipHash ? `ip-${s.ipHash}` : "Anonymous"}
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
