"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { useAuthStore } from "@/store/auth";
import { CalendarDays, ChevronDown, Menu } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { currentUser } = useAuthStore();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = time.getHours();
  const greeting =
    hours < 11 ? "Selamat Pagi" :
    hours < 15 ? "Selamat Siang" :
    hours < 18 ? "Selamat Sore" : "Selamat Malam";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 md:h-16 shrink-0 flex items-center justify-between px-3 md:px-6 bg-white border-b border-slate-200">
          {/* Left: Greeting */}
          <div className="flex items-center gap-3">
            {/* Hamburger menu for mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] md:text-[11px] font-semibold text-[#4B736A] uppercase tracking-widest leading-none">
                 {greeting} {currentUser?.nama || ""}
               </p>
              <p className="text-sm md:text-base font-bold text-slate-800 leading-tight mt-0.5">
                {time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Date & Time */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">
                {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-200 cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-[#4B736A] flex items-center justify-center text-white text-sm font-bold">
                {currentUser?.nama?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-700 leading-none">{currentUser?.nama}</p>
                <p className="text-[10px] text-[#4B736A] font-semibold mt-0.5 uppercase">
                  {currentUser?.role}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-white pl-4 lg:pl-6">
          {children}
        </main>
      </div>
    </div>
  );
}