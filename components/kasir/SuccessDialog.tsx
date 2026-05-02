"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate, formatTime } from "@/lib/utils";
import { MetodePembayaran } from "@/lib/types";
import { Printer, CheckCircle2, Receipt, Store, Clock, Calendar, Package, Upload, X, ImageIcon } from "lucide-react";

interface CartItem {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  jumlah: number;
  gambar?: string;
  deskripsi?: string;
}

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaksiId: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  metodePembayaran: MetodePembayaran;
  bayar: number;
  kembalian: number;
  catatan?: string;
  tanggal: string;
  onUploadBukti?: (transaksiId: string, buktiPenjualan: string) => void;
}

const metodeLabel: Record<MetodePembayaran, string> = {
  TUNAI: "Tunai",
  TRANSFER: "Transfer Bank",
};

export function SuccessDialog({
  open,
  onOpenChange,
  transaksiId,
  items,
  subtotal,
  total,
  metodePembayaran,
  bayar,
  kembalian,
  catatan,
  tanggal,
  onUploadBukti,
}: SuccessDialogProps) {
  const [buktiPenjualan, setBuktiPenjualan] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap upload file gambar (JPG, PNG, dll)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBuktiPenjualan(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeBukti = () => {
    setBuktiPenjualan(null);
  };

  const handleUploadBukti = async () => {
    if (!buktiPenjualan) return;
    setUploading(true);
    try {
      if (onUploadBukti) {
        await onUploadBukti(transaksiId, buktiPenjualan);
      } else {
        const res = await fetch(`/api/transaksi/${transaksiId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buktiPenjualan }),
        });
        if (!res.ok) throw new Error("Gagal upload");
      }
      alert("Bukti penjualan berhasil diupload!");
    } catch (error) {
      alert("Gagal mengupload bukti penjualan");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200">
          <DialogTitle className="sr-only">Transaksi Berhasil</DialogTitle>
          {/* Header Sukses */}
          <div className="text-center pt-8 pb-2 px-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Transaksi Berhasil!</h2>
            <p className="text-sm text-slate-500 mt-1">Pembayaran telah diterima</p>
          </div>

          {/* Struk */}
          <div className="px-6 pb-2">
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
              {/* Header Struk */}
              <div className="text-center p-4 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Store className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900">Keripik Pisang</h3>
                </div>
                <p className="text-[11px] text-slate-500">Jl. Pisang No. 123, Jakarta</p>
                <p className="text-[11px] text-slate-500">Telp: 0812-3456-7890</p>
              </div>

              {/* Info */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Receipt className="h-3 w-3" />
                  <span>#{transaksiId.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(tanggal)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(tanggal)}</span>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-50">
                {items.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="flex justify-between items-center px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden">
                        {item.gambar ? (
                          <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.nama}</p>
                        <p className="text-[11px] text-slate-500">{item.kategori}</p>
                        {item.deskripsi && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.deskripsi}</p>
                        )}
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.jumlah} &times; {formatRupiah(item.harga)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatRupiah(item.harga * item.jumlah)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="px-4 py-3 border-t border-slate-100 space-y-1">
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-[#4A776E]">{formatRupiah(total)}</span>
                </div>
              </div>

              {/* Bayar Detail */}
              <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-50 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Metode</span>
                  <Badge variant="outline" className="text-xs font-medium border-slate-200">
                    {metodeLabel[metodePembayaran]}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Bayar</span>
                  <span className="font-medium text-slate-700">{formatRupiah(bayar)}</span>
                </div>
                {kembalian > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Kembalian</span>
                    <span className="font-medium text-emerald-600">
                      {formatRupiah(kembalian)}
                    </span>
                  </div>
                )}
              </div>

              {catatan && (
                <div className="px-4 py-2 border-t border-slate-50 text-[11px] text-slate-500">
                  <span className="font-medium">Catatan:</span> {catatan}
                </div>
              )}

              {/* Footer */}
              <div className="text-center p-3 border-t border-slate-50 bg-slate-50/30">
                <p className="text-[11px] text-slate-500">Terima kasih telah berbelanja</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Barang yang sudah dibeli tidak dapat dikembalikan
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <DialogFooter className="flex-col sm:flex-col gap-2 px-6 pb-6 pt-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="w-full h-10 border-slate-200 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Cetak Struk
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full h-10 bg-[#4A776E] hover:bg-[#4A776E]/90 text-white"
            >
              Transaksi Baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print-only receipt */}
      <div className="hidden print:block">
        <div className="p-6 max-w-[72mm] mx-auto">
          <div className="text-center mb-3">
            <h2 className="text-lg font-bold text-slate-900">Keripik Pisang</h2>
            <p className="text-[10px] text-slate-500">Jl. Pisang No. 123, Jakarta</p>
            <p className="text-[10px] text-slate-500">Telp: 0812-3456-7890</p>
          </div>
          <div className="border-t border-dashed border-slate-300 py-2 mb-2">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>{formatDate(tanggal)} {formatTime(tanggal)}</span>
              <span>#{transaksiId.slice(-8).toUpperCase()}</span>
            </div>
          </div>

          <div className="space-y-1 mb-3">
            {items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex justify-between text-xs">
                <div className="flex-1">
                  <span className="font-medium">{item.nama}</span>
                  <span className="text-slate-500 ml-1">
                    {item.jumlah}x @{formatRupiah(item.harga)}
                  </span>
                </div>
                <span className="font-medium">{formatRupiah(item.harga * item.jumlah)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-xs">
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL</span>
              <span>{formatRupiah(total)}</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-dashed border-slate-300 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Metode</span>
              <span>{metodeLabel[metodePembayaran]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bayar</span>
              <span>{formatRupiah(bayar)}</span>
            </div>
            {kembalian > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Kembalian</span>
                <span>{formatRupiah(kembalian)}</span>
              </div>
            )}
          </div>

          {catatan && (
            <div className="mt-2 text-[10px] text-slate-500">
              Catatan: {catatan}
            </div>
          )}

          <div className="text-center mt-4 pt-3 border-t border-dashed border-slate-300">
            <p className="text-[10px] text-slate-500">Terima kasih telah berbelanja</p>
          </div>
        </div>
      </div>
    </>
  );
}