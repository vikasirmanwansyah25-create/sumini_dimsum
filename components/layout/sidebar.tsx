"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  ShoppingCart,
  ShoppingBag,
  History,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, desc: "Overview" },
  { href: "/admin/inventory", label: "Inventory", icon: Package, desc: "Bahan" },
  { href: "/admin/produk", label: "Produk", icon: ShoppingBag, desc: "Menu" },
  { href: "/admin/users", label: "Users", icon: Users, desc: "Pengguna" },
  { href: "/admin/laporan", label: "Laporan", icon: Receipt, desc: "Analitik" },
];

const cashierLinks = [
  { href: "/cashier", label: "Dashboard", icon: LayoutDashboard, desc: "Overview" },
  { href: "/cashier/transaksi", label: "Transaksi", icon: ShoppingCart, desc: "Kasir" },
  { href: "/cashier/inventory", label: "Inventory", icon: Package, desc: "Bahan" },
  { href: "/cashier/riwayat", label: "Riwayat", icon: History, desc: "Histori" },
];

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuthStore();
  const links = currentUser?.role === "ADMIN" ? adminLinks : cashierLinks;
  const isAdmin = currentUser?.role === "ADMIN";

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "flex flex-col h-screen transition-all duration-300 ease-in-out shrink-0",
          "bg-[#4B736A]",
          "fixed z-50 lg:static lg:translate-x-0",
          "top-0 left-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-20 px-4 border-b border-white/20",
          collapsed ? "justify-center" : "gap-2"
        )}>
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
             <img src="/gambar/logo1.png" alt="SUMUNI" className="w-full h-full object-contain" />
           </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="font-bold text-xs text-white tracking-tight leading-none truncate">
                 SUMINI-DIMSUM
               </div>
                <div className="text-[10px] text-white/60 font-medium uppercase mt-0.5 truncate">
                  SUMINI-DIMSUM System
                </div>
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-white/20 text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="text-[11px] font-medium text-white uppercase">
              {isAdmin ? "Administrator" : "Kasir"}
            </span>
          </div>
          <p className="text-[11px] text-white/60 mt-0.5 truncate">
            {currentUser?.nama}
          </p>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 mt-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-2 mb-2">
            <span className="text-[9px] font-medium text-white/50 uppercase tracking-[0.15em]">
              Navigasi
            </span>
          </div>
        )}
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link key={link.href} href={link.href} className="block">
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer",
                  isActive
                     ? "bg-white text-[#4B736A]"
                     : "hover:bg-white/20 text-white"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                  isActive
                    ? "bg-white"
                    : "bg-white/20"
                )}>
                  <Icon className="h-[17px] w-[17px]" />
                </div>

                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block leading-none">
                      {link.label}
                    </span>
                    <span className="text-[10px] mt-0.5 block text-white/60">
                      {link.desc}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/20 space-y-1">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full",
            "text-white/70 hover:bg-red-500/20 hover:text-red-400",
            collapsed ? "justify-center" : ""
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 group-hover:bg-red-500/30 flex items-center justify-center shrink-0">
            <LogOut className="h-[16px] w-[16px]" />
          </div>
          {!collapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>

        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full",
            "text-white/70 hover:bg-white/20 hover:text-white",
            collapsed ? "justify-center" : ""
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            {collapsed ? (
              <ChevronsRight className="h-[16px] w-[16px]" />
            ) : (
              <ChevronsLeft className="h-[16px] w-[16px]" />
            )}
          </div>
          {!collapsed && <span className="text-sm font-medium">Sembunyikan</span>}
        </button>
      </div>
    </aside>
  </>
  );
}