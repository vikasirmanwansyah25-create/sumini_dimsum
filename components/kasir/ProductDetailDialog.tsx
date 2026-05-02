"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { Produk } from "@/lib/types";
import { Plus, Package, ImageIcon, Scale, Tag, FileText } from "lucide-react";

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produk: Produk | null;
  onAddToCart: (produk: Produk) => void;
}

const kategoriColors: Record<string, string> = {
  Original: "bg-slate-100 text-slate-600",
  Keju: "bg-blue-100 text-blue-600",
  Pedas: "bg-red-100 text-red-600",
  Coklat: "bg-amber-100 text-amber-600",
  Balado: "bg-orange-100 text-orange-600",
  BBQ: "bg-indigo-100 text-indigo-600",
  Manis: "bg-pink-100 text-pink-600",
  Spesial: "bg-purple-100 text-purple-600",
};

export function ProductDetailDialog({
  open,
  onOpenChange,
  produk,
  onAddToCart,
}: ProductDetailDialogProps) {
  if (!produk) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Detail Produk
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
            {produk.gambar ? (
              <img
                src={produk.gambar}
                alt={produk.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-slate-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  className={`text-xs px-2 py-0.5 ${
                    kategoriColors[produk.kategori || "Original"] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {produk.kategori || "Original"}
                </Badge>
                {!produk.tersedia && (
                  <Badge className="text-xs px-2 py-0.5 bg-red-500 text-white">
                    Tidak Tersedia
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                {produk.nama}
              </h2>
            </div>

            {produk.deskripsi && (
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                <p>{produk.deskripsi}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500">Harga</p>
              <p className="text-2xl font-bold text-[#4A776E]">
                {formatRupiah(produk.harga)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 border-slate-200"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
          <Button
            className="flex-1 bg-[#4A776E] hover:bg-[#4A776E]/90 text-white"
            onClick={() => {
              onAddToCart(produk);
              onOpenChange(false);
            }}
            disabled={!produk.tersedia}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah ke Keranjang
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}