"use client";

import * as React from "react";
import { Plus, Search, Package, Filter, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRupiah } from "@/lib/utils";
import { Produk } from "@/lib/types";

interface ProdukListProps {
  filterKategori: string;
  onFilterChange: (value: string) => void;
  onAddItem: (menu: Produk) => void;
  cabangId?: string | null;
}

export function ProdukList({ filterKategori, onFilterChange, onAddItem, cabangId }: ProdukListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [menu, setMenu] = React.useState<Produk[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Dynamic kategori options from menu data
  const kategoriOptions = React.useMemo(() => {
    const uniqueKategori = Array.from(new Set(menu.map((p) => p.kategori).filter((k): k is string => typeof k === "string")));
    return ["Semua", ...uniqueKategori.sort()];
  }, [menu]);

  React.useEffect(() => {
    const url = cabangId ? `/api/menu?cabangId=${cabangId}` : "/api/menu";
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setMenu(json.data);
        }
      })
      .catch((err) => console.error("Fetch menu error:", err))
      .finally(() => setLoading(false));
  }, [cabangId]);

  const filteredMenu = React.useMemo(() => {
    let result = filterKategori === "Semua"
      ? menu
      : menu.filter((p) => p.kategori === filterKategori);

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [filterKategori, searchTerm, menu]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#26B0AC]/20 border-t-[#26B0AC] rounded-full animate-spin" />
        <p className="text-slate-500 mt-4">Memuat menu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-semibold text-slate-800">Kasir</h1>
          <p className="text-xs lg:text-sm text-slate-500">Pilih menu untuk ditambahkan ke keranjang</p>
        </div>
        <div className="flex items-center gap-2 px-2 lg:px-3 py-1.5 bg-white border border-slate-200 rounded-lg">
           <span className="text-xs lg:text-sm text-slate-600">{menu.length} menu</span>
         </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari menu..."
            className="pl-9 lg:pl-10 h-10 bg-white border-slate-200 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterKategori} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full sm:w-32 lg:w-40 bg-white border-slate-200 rounded-lg">
            <Filter className="h-4 w-4 text-slate-400 mr-2" />
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {kategoriOptions.map((kat) => (
              <SelectItem key={kat} value={kat as string}>
                {kat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredMenu.map((menu) => (
          <Card
            key={menu.id}
            className="cursor-pointer hover:shadow-lg hover:border-[#26B0AC] transition-all bg-white border-slate-200 overflow-hidden group"
            onClick={() => menu.tersedia && onAddItem(menu)}
          >
            {/* Image */}
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {menu.gambar ? (
                  <img
                    src={menu.gambar}
                    alt={menu.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 lg:h-16 w-12 lg:w-16 text-slate-300" />
                  </div>
                )}
                {!menu.tersedia && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge className="text-[10px] px-3 py-1 bg-red-500 text-white">
                    Tidak Tersedia
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium text-slate-800 truncate">{menu.nama}</p>
              {menu.deskripsi && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{menu.deskripsi}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold text-[#4A776E]">{formatRupiah(menu.harga)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (menu.tersedia) {
                      onAddItem(menu);
                    }
                  }}
                  className="w-7 h-7 bg-[#4A776E] hover:bg-[#4A776E]/90 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={!menu.tersedia}
                >
                  <Plus className="h-4 w-4 text-white font-bold" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

        {filteredMenu.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Menu tidak ditemukan</p>
          </div>
        )}
    </div>
  );
}
