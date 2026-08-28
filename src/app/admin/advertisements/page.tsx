"use client";

import { useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  QrCode,
  Download,
  Calendar,
  Building2,
  Tv,
  PauseCircle,
  PlayCircle,
  XCircle,
  BarChart3,
  Search,
  AlertCircle,
  TicketPercent,
  ScanLine,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCodeModal from "@/components/admin/QRCodeModal";
import { formatDate } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
}

interface Billboard {
  id: string;
  code: string;
  name: string;
}

interface Advertisement {
  id: string;
  name: string;
  offerTitle: string;
  discountDescription: string;
  couponLimit: number | null;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "DISABLED";
  company: Company;
  billboard: Billboard;
  campaign?: {
    id: string;
    campaignCode: string;
    qrUrl: string;
  };
  stats: {
    scans: number;
    claims: number;
    redemptions: number;
  };
  createdAt: string;
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalAd, setQrModalAd] = useState<Advertisement | null>(null);

  const [formData, setFormData] = useState({
    companyId: "",
    billboardId: "",
    name: "",
    offerTitle: "",
    discountDescription: "",
    couponLimit: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adsRes, compRes, billRes] = await Promise.all([
        fetch("/api/advertisements"),
        fetch("/api/companies"),
        fetch("/api/billboards"),
      ]);

      const adsData = await adsRes.json();
      const compData = await compRes.json();
      const billData = await billRes.json();

      if (adsData.success) setAds(adsData.advertisements);
      if (compData.success) setCompanies(compData.companies);
      if (billData.success) setBillboards(billData.billboards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      companyId: companies[0]?.id || "",
      billboardId: billboards[0]?.id || "",
      name: "",
      offerTitle: "",
      discountDescription: "",
      couponLimit: "500",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "ACTIVE",
    });
    setError("");
    setModalOpen(true);
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/advertisements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create advertisement");
        setSaving(false);
        return;
      }

      setModalOpen(false);
      await fetchData();

      // Automatically open the generated QR code modal for convenience!
      if (data.advertisement) {
        setQrModalAd(data.advertisement);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (ad: Advertisement, newStatus: string) => {
    try {
      await fetch("/api/advertisements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ad.id, status: newStatus }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = ads.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.offerTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.company.name.toLowerCase().includes(search.toLowerCase()) ||
      a.campaign?.campaignCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Advertisements & QR Campaigns</h2>
          <p className="text-xs text-slate-500 mt-1">
            Every advertisement gets its own dedicated QR code to display on digital billboards
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl text-xs md:text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Advertisement</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Ad name, offer title, company or campaign code (e.g. CAMP-001)..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Campaign & Ad</th>
                <th className="px-6 py-4">Offer Details</th>
                <th className="px-6 py-4">Company & Billboard</th>
                <th className="px-6 py-4">Validity</th>
                <th className="px-6 py-4 text-center">Scans</th>
                <th className="px-6 py-4 text-center">Claims</th>
                <th className="px-6 py-4 text-center">Redeemed</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No campaigns found. Click "+ Create Advertisement" to launch your first QR campaign!
                  </td>
                </tr>
              ) : (
                filtered.map((ad) => (
                  <tr key={ad.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200/50">
                          {ad.campaign?.campaignCode || "N/A"}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 mt-1">{ad.name}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                        {ad.offerTitle}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{ad.discountDescription}</p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {ad.company.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Tv className="w-3.5 h-3.5 text-slate-400" />
                        {ad.billboard.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[11px] text-slate-600">
                      <div>Start: {formatDate(ad.startDate)}</div>
                      <div>End: {formatDate(ad.endDate)}</div>
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-amber-600">{ad.stats?.scans ?? 0}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600">{ad.stats?.claims ?? 0}</td>
                    <td className="px-6 py-4 text-center font-bold text-rose-600">{ad.stats?.redemptions ?? 0}</td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ad.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : ad.status === "PAUSED"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ad.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* QR Code Action Button */}
                        <button
                          onClick={() => setQrModalAd(ad)}
                          className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          title="View and Download QR Code for billboard video"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Asset</span>
                        </button>

                        {/* Status Toggle Button */}
                        {ad.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleToggleStatus(ad, "PAUSED")}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Pause Campaign"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(ad, "ACTIVE")}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Activate Campaign"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code View / Download Modal */}
      {qrModalAd && qrModalAd.campaign && (
        <QRCodeModal
          isOpen={!!qrModalAd}
          onClose={() => setQrModalAd(null)}
          campaignCode={qrModalAd.campaign.campaignCode}
          qrUrl={qrModalAd.campaign.qrUrl}
          adName={qrModalAd.name}
          companyName={qrModalAd.company.name}
          offerTitle={qrModalAd.offerTitle}
          billboardName={qrModalAd.billboard.name}
        />
      )}

      {/* Create Advertisement Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Launch New Billboard QR Campaign</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    A unique QR code and landing page will automatically be created.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateAd} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company / Advertiser</label>
                    <select
                      required
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Billboard</label>
                    <select
                      required
                      value={formData.billboardId}
                      onChange={(e) => setFormData({ ...formData, billboardId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
                    >
                      {billboards.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.code} - {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Advertisement Campaign Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Restaurant Summer Special"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Offer Title / Badge</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 20% OFF or Flat ₹200 OFF"
                      value={formData.offerTitle}
                      onChange={(e) => setFormData({ ...formData, offerTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Coupon Claim Limit (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={formData.couponLimit}
                      onChange={(e) => setFormData({ ...formData, couponLimit: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Offer Terms & Description</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Valid on dine-in bill above ₹500. Not applicable on combo items."
                    value={formData.discountDescription}
                    onChange={(e) => setFormData({ ...formData, discountDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Campaign Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Campaign Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                    />
                  </div>
                </div>

                {/* Important Video Note */}
                <div className="bg-slate-900 text-white p-3.5 rounded-2xl">
                  <p className="font-bold text-cyan-400">⚡ Automatic QR Generation</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Upon clicking create, a unique campaign code will be reserved and a high-res QR asset will be
                    generated for your billboard media workflow.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {saving ? "Generating Campaign..." : "Create & Generate QR"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
