"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Package, ArrowUpRight, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cabang } from "@/lib/types";

export default function CashierDashboardPage() {
  const [stats, setStats] = React.useState<any>(null);
  const [stokMenipis, setStokMenipis] = React.useState<any[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [cabangData, setCabangData] = React.useState<Cabang | null>(null);

  const { currentUser } = useAuthStore();

  React.useEffect(() => {
    fetchDashboardData();
    fetchCabangData();
  }, [currentUser?.cabangId]);

  const fetchCabangData = async () => {
    if (currentUser?.cabang?.nama) {
      setCabangData(currentUser.cabang as Cabang);
      return;
    }

    if (currentUser?.cabangId) {
      try {
        const res = await fetch(`/api/cabang/${currentUser.cabangId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCabangData(json.data);
          }
        }
      } catch (error) {
        console.error("Error fetching cabang:", error);
      }
    }
  };

  const fetchDashboardData = async () => {
    setLoadingStats(true);
    try {
      const [statsRes, bahanRes] = await Promise.all([
        fetch(`/api/transaksi/stats${currentUser?.cabangId ? `?cabangId=${currentUser.cabangId}` : ""}`),
        fetch(`/api/bahan-baku${currentUser?.cabangId ? `?cabangId=${currentUser.cabangId}` : ""}`),
      ]);

      const statsJson = await statsRes.json();
      const bahanJson = await bahanRes.json();

      if (statsJson.success) setStats(statsJson.data);
      if (bahanJson.success) setStokMenipis(bahanJson.data.filter((p: any) => p.stok < 20));
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const cabangName = cabangData?.nama || currentUser?.cabang?.nama || "Pusat";

  const statCards = stats
    ? [
        {
          title: "Total Penjualan",
          value: formatRupiah(stats.summary.totalPenjualan),
          change: stats.summary.totalTransaksi + " transaksi",
          isPositive: true,
          icon: DollarSign,
          bg: "bg-blue-50",
          text: "text-blue-600",
          border: "border-blue-200",
        },
        {
          title: "Total Laba",
          value: formatRupiah(stats.summary.totalLaba),
          change: stats.summary.totalLaba > 0 ? "Positif" : "Break-even",
          isPositive: stats.summary.totalLaba >= 0,
          icon: TrendingUp,
          bg: "bg-green-50",
          text: "text-green-600",
          border: "border-green-200",
        },
        {
          title: "Total Transaksi",
          value: stats.summary.totalTransaksi.toString(),
          change: "7 hari terakhir",
          isPositive: true,
          icon: ShoppingBag,
          bg: "bg-purple-50",
          text: "text-purple-600",
          border: "border-purple-200",
        },
        {
          title: "Stok Menipis",
          value: stokMenipis.length.toString(),
          change: stokMenipis.length > 0 ? "Perlu restok" : "Semua aman",
          isPositive: stokMenipis.length === 0,
          icon: Package,
          bg: stokMenipis.length > 0 ? "bg-red-50" : "bg-green-50",
          text: stokMenipis.length > 0 ? "text-red-600" : "text-green-600",
          border: stokMenipis.length > 0 ? "border-red-200" : "border-green-200",
        },
      ]
    : [];

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg lg:text-xl font-bold text-slate-800">SUMINI-DIMSUM</h1>
        <p className="text-sm lg:text-base text-slate-500">
          Dashboard {cabangName}
        </p>
      </div>

      {loadingStats ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-3 lg:gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className={`border ${stat.border} bg-white`}>
                  <CardContent className="p-4 lg:p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-slate-500">{stat.title}</p>
                        <p className="text-xl lg:text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        <div className={`flex items-center gap-1 mt-1.5 lg:mt-2 text-[10px] lg:text-xs font-medium ${stat.text}`}>
                          <ArrowUpRight className="h-3 w-3" />
                          {stat.change}
                        </div>
                      </div>
                      <div className={`p-2 lg:p-3 rounded-lg ${stat.bg}`}>
                        <Icon className={`h-4 lg:h-5 w-4 lg:w-5 ${stat.text}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts & Stok */}
          <div className="grid gap-4 lg:grid-cols-7">
            {/* Chart */}
            <Card className="lg:col-span-4 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm lg:text-base font-semibold text-slate-800">Tren Penjualan</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="7hari">
                  <TabsList className="mb-3 lg:mb-4 bg-slate-100 h-7 lg:h-8">
                    <TabsTrigger value="7hari" className="text-xs data-[state=active]:bg-white">7 Hari</TabsTrigger>
                    <TabsTrigger value="30hari" className="text-xs data-[state=active]:bg-white">30 Hari</TabsTrigger>
                  </TabsList>
                  {["7hari", "30hari"].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                      <div className="h-52 lg:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={stats ? (tab === "7hari" ? stats.grafik7Hari : stats.grafik30Hari) : []}
                            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id={`gradP-${tab}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id={`gradL-${tab}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="tanggal" stroke="#94a3b8" fontSize={10} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v: any) => "Rp" + Math.round(v / 1000) + "rb"} />
                            <Tooltip formatter={(value: any) => formatRupiah(value)} />
                            <Area type="monotone" dataKey="penjualan" stroke="#3b82f6" strokeWidth={2} fill={`url(#gradP-${tab})`} />
                            <Area type="monotone" dataKey="laba" stroke="#22c55e" strokeWidth={2} fill={`url(#gradL-${tab})`} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Stok Menipis */}
            <Card className="lg:col-span-3 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm lg:text-base font-semibold text-slate-800">Stok Menipis</CardTitle>
              </CardHeader>
              <CardContent>
                {stokMenipis.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 lg:h-52 text-center">
                    <Package className="h-8 lg:h-10 w-8 lg:w-10 text-green-400 mb-2 lg:3" />
                    <p className="font-medium text-sm lg:text-base text-green-600">Semua Stok Aman</p>
                    <p className="text-[10px] lg:text-xs text-slate-400 mt-0.5">Tidak ada produk perlu direstock</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 lg:max-h-80 overflow-auto">
                    {stokMenipis.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-2 lg:p-3 bg-white border border-red-100 rounded-lg hover:border-red-200">
                        <div className="flex items-center gap-2 lg:3">
                          <div className="w-8 lg:w-10 h-8 lg:h-10 bg-red-50 rounded-lg flex items-center justify-center">
                            <Package className="h-4 lg:h-5 w-4 lg:w-5 text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium text-xs lg:text-sm text-slate-800">{p.nama}</p>
                            <p className="text-[10px] lg:text-xs text-slate-400">{p.rasa} &bull; {p.berat}g</p>
                          </div>
                        </div>
                        <span className="text-red-500 border-red-200 text-[10px] lg:text-xs">
                          {p.stok} {(p as any).satuan || 'pcs'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Menu Management section removed as requested */}
    </div>
  );
}
