"use client";

import { Bell, Search, User } from "lucide-react";

interface AdminHeaderProps {
  adminEmail?: string;
  adminName?: string;
}

export default function AdminHeader({ adminEmail, adminName }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="relative w-64 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns, boards, coupons..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Live
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">{adminName || "Admin"}</p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{adminEmail || "Portal Administrator"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
