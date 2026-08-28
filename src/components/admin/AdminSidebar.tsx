"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Tv,
  Megaphone,
  QrCode,
  TicketPercent,
  ScanLine,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Advertisements & QR", href: "/admin/advertisements", icon: Megaphone },
    { label: "Companies", href: "/admin/companies", icon: Building2 },
    { label: "Billboards", href: "/admin/billboards", icon: Tv },
    { label: "Coupons & Claims", href: "/admin/coupons", icon: TicketPercent },
    { label: "Live QR Scans", href: "/admin/scans", icon: ScanLine },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <QrCode className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-black text-lg tracking-tight leading-none text-white">
            iSquare <span className="text-cyan-400 font-light text-sm">Boards</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Admin Console
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick Links & Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <Link
          href="/shop/verify"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
        >
          <span>Open Shop POS Scanner</span>
          <span className="text-[10px] bg-cyan-900/60 text-cyan-300 px-1.5 py-0.5 rounded">Staff</span>
        </Link>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
