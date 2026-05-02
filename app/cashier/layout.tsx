"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuthStore } from "@/store/auth";

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAuthStore();

  React.useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    } else if (currentUser.role === "ADMIN") {
      router.push("/admin");
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== "KASIR") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-700" />
      </div>
    );
  }

  if (pathname === "/cashier") {
    return <MainLayout>{children}</MainLayout>;
  }

  return <MainLayout>{children}</MainLayout>;
}