"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Copy, Check, X, ExternalLink, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignCode: string;
  qrUrl: string;
  adName: string;
  companyName: string;
  offerTitle: string;
  billboardName: string;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  campaignCode,
  qrUrl,
  adName,
  companyName,
  offerTitle,
  billboardName,
}: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && qrUrl) {
      QRCode.toDataURL(qrUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR Generate error:", err));
    }
  }, [isOpen, qrUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    // Generate framed high-res image for Billboard Video team
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1000;
    canvas.height = 1200;

    // Dark sleek card background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cyan highlight border
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Header text
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 38px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("iSquare Bill Boards", 500, 110);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px Inter, sans-serif";
    ctx.fillText(companyName.toUpperCase(), 500, 180);

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 52px Inter, sans-serif";
    ctx.fillText(offerTitle, 500, 250);

    // Draw QR Code
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      // White container box for QR
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(175, 310, 650, 650);

      ctx.drawImage(qrImg, 200, 335, 600, 600);

      // Footer callout
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 42px Inter, sans-serif";
      ctx.fillText("SCAN WITH YOUR PHONE CAMERA", 500, 1030);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "28px Inter, sans-serif";
      ctx.fillText(`Campaign: ${campaignCode}  |  ${billboardName}`, 500, 1100);

      // Trigger download
      const link = document.createElement("a");
      link.download = `iSquare-${campaignCode}-${companyName.replace(/\s+/g, "_")}-QR.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full">
                {campaignCode}
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-1">Billboard QR Code Asset</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 text-center">
            {/* Billboard Presentation Card Preview */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 rounded-2xl border-2 border-cyan-500/30 text-white shadow-xl mb-5">
              <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">iSquare Bill Boards</p>
              <h4 className="text-lg font-black text-white mt-1">{companyName}</h4>
              <p className="text-amber-400 font-bold text-base mt-0.5">{offerTitle}</p>

              <div className="bg-white p-3.5 rounded-xl shadow-inner inline-block my-4">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Campaign QR Code" className="w-48 h-48 mx-auto" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-1 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Scan & Get Instant Discount Coupon</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Display Location: {billboardName}</p>
            </div>

            {/* Target URL */}
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-left mb-6">
              <span className="text-xs text-slate-500 font-mono flex-1 truncate">{qrUrl}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800 px-2 py-1 bg-cyan-100/60 rounded hover:bg-cyan-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={qrUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-slate-400 hover:text-slate-700"
                title="Preview Customer Page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Instructions for Video Editor */}
            <div className="text-left bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 mb-6">
              <p className="text-xs font-semibold text-amber-900">🎬 Note for iSquare Video Team:</p>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                Download this high-resolution PNG and overlay it onto the advertiser's video before loading it to the
                billboard media player.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownloadPNG}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
