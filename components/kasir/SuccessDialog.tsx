"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate, formatTime } from "@/lib/utils";
import { MetodePembayaran } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
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
  cabangNama?: string;
  cabangAlamat?: string;
  cabangTelepon?: string;
}

const metodeLabel: Record<MetodePembayaran, string> = {
  TUNAI: "Tunai",
  QUIRZ: "QRIS",
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
  cabangNama: propCabangNama,
  cabangAlamat: propCabangAlamat,
  cabangTelepon: propCabangTelepon,
}: SuccessDialogProps) {
  const { currentUser } = useAuthStore();
  
  const cabangNama = propCabangNama || currentUser?.cabang?.nama || "Nama Cabang";
  const cabangAlamat = propCabangAlamat || currentUser?.cabang?.alamat || "Alamat Cabang";
  const cabangTelepon = propCabangTelepon || currentUser?.cabang?.telepon || "0812-3456-7890";
  const [buktiPenjualan, setBuktiPenjualan] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handlePrint = () => {
     const printWindow = window.open('', '_blank');
     if (!printWindow) {
       alert('Popup diblokir. Harap izinkan popup untuk mencetak struk.');
       return;
     }

     let itemsHTML = '';
     items.forEach(item => {
       itemsHTML += '<tr>';
       itemsHTML += '<td style="padding:4px 2px; font-size:11px; width:30px;">' + item.jumlah + 'x</td>';
       itemsHTML += '<td style="padding:4px 2px; font-size:11px;">' + item.nama + '</td>';
       itemsHTML += '<td style="text-align:right; padding:4px 2px; font-size:11px; width:75px;">' + formatRupiah(item.harga * item.jumlah) + '</td>';
       itemsHTML += '</tr>';
       if (item.deskripsi) {
         itemsHTML += '<tr><td colspan="3" style="padding:0 2px 4px 30px; font-size:9px; color:#666;">' + item.deskripsi + '</td></tr>';
       }
     });

     let receiptParts = [];
     receiptParts.push('<html><head><title>Struk</title><meta charset="utf-8">');
     receiptParts.push('<style>*{margin:0;padding:0;box-sizing:border-box;}');
     receiptParts.push('body{font-family:"Courier New",Courier,monospace;font-size:11px;line-height:1.2;width:75mm;margin:0 auto;padding:2mm;color:#000;}');
     receiptParts.push('table{width:100%;border-collapse:collapse;}td{vertical-align:top;}');
     receiptParts.push('.center{text-align:center;}.dash{border-top:1px dashed #000;margin:5px 0;}');
     receiptParts.push('.store{font-size:14px;font-weight:bold;margin-bottom:3px;}');
     receiptParts.push('.info{font-size:10px;color:#555;}');
     receiptParts.push('.rinfo{margin:5px 0;padding:5px 0;border-top:1px dashed #000;border-bottom:1px dashed #000;font-size:10px;text-align:center;}');
     receiptParts.push('.total{margin-top:6px;padding-top:6px;border-top:2px solid #000;font-weight:bold;font-size:12px;}');
     receiptParts.push('.pay{margin-top:5px;padding-top:5px;border-top:1px dashed #000;font-size:10px;}');
     receiptParts.push('.footer{margin-top:6px;padding-top:6px;border-top:1px dashed #000;text-align:center;font-size:10px;color:#555;}');
     receiptParts.push('@media print{body{padding:0;width:100%;}@page{margin:2mm;size:80mm auto;}}');
     receiptParts.push('</style></head><body>');

     receiptParts.push('<div style="text-align:center;margin-bottom:6px;">');
     receiptParts.push('<div style="font-size:14px;font-weight:bold;">' + cabangNama.toUpperCase() + '</div>');
     if (cabangAlamat) receiptParts.push('<div style="font-size:10px;color:#555;">' + cabangAlamat + '</div>');
     if (cabangTelepon) receiptParts.push('<div style="font-size:10px;color:#555;">Telp: ' + cabangTelepon + '</div>');
     receiptParts.push('</div>');

     receiptParts.push('<div class="rinfo">');
     receiptParts.push('<div>#' + transaksiId.slice(-8).toUpperCase() + '</div>');
     receiptParts.push('<div>' + formatDate(tanggal) + ' ' + formatTime(tanggal) + '</div>');
     receiptParts.push('<div>' + metodeLabel[metodePembayaran] + '</div>');
     receiptParts.push('</div>');

     receiptParts.push('<table><tr><td colspan="3"><div class="dash"></div></td></tr>');
     receiptParts.push(itemsHTML);
     receiptParts.push('<tr><td colspan="3"><div class="dash"></div></td></tr></table>');

     receiptParts.push('<table class="total"><tr><td>TOTAL</td><td style="text-align:right;">' + formatRupiah(total) + '</td></tr></table>');

     receiptParts.push('<table class="pay"><tr><td>Bayar</td><td style="text-align:right;">' + formatRupiah(bayar) + '</td></tr>');
     if (kembalian > 0) receiptParts.push('<tr><td>Kembali</td><td style="text-align:right;">' + formatRupiah(kembalian) + '</td></tr>');
     receiptParts.push('</table>');

     if (catatan) {
       receiptParts.push('<div class="pay"><div style="margin-bottom:2px;"><b>Catatan:</b></div><div>' + catatan + '</div></div>');
     }

     receiptParts.push('<div class="footer"><div>~ Terima Kasih ~</div>');
     receiptParts.push('<div style="margin-top:2px;">Barang dibeli tidak</div>');
     receiptParts.push('<div>dapat dikembalikan</div></div>');

     receiptParts.push('</body></html>');

     printWindow.document.write(receiptParts.join(''));
     printWindow.document.close();

     printWindow.onload = function() {
       setTimeout(function() {
         printWindow.print();
         setTimeout(function() {
           printWindow.close();
         }, 500);
       }, 250);
     };
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
      {/* Screen Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200">
          <DialogTitle className="sr-only">Transaksi Berhasil</DialogTitle>
          {/* Header Sukses */}
          <div className="text-center pt-8 pb-2 px-6 print:hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Transaksi Berhasil!</h2>
            <p className="text-sm text-slate-500 mt-1">Pembayaran telah diterima</p>
          </div>

           {/* Struk Preview - Print Friendly */}
           <div className="px-6 pb-2 receipt-print-area">
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden print:border-0 print:rounded-none">
              {/* Header Struk */}
               <div className="text-center p-4 border-b border-slate-50 bg-slate-50/50 print:bg-white">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Store className="h-5 w-5 text-amber-500 print:hidden" />
                  <h3 className="font-bold text-slate-900">{cabangNama}</h3>
                </div>
                {cabangAlamat && <p className="text-[11px] text-slate-500">{cabangAlamat}</p>}
              </div>

              {/* Info */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Receipt className="h-3 w-3 print:hidden" />
                  <span>#{transaksiId.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 print:hidden" />
                  <span>{formatDate(tanggal)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 print:hidden" />
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
              <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-50 space-y-1 print:bg-white">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Metode</span>
                  <Badge variant="outline" className="text-xs font-medium border-slate-200 print:border-0 print:bg-transparent">
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
              <div className="text-center p-3 border-t border-slate-50 bg-slate-50/30 print:bg-white">
                <p className="text-[11px] text-slate-500">Terima kasih telah berbelanja</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Barang yang sudah dibeli tidak dapat dikembalikan
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
           <DialogFooter className="flex-col sm:flex-col gap-2 px-6 pb-6 pt-2 print:hidden">
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
     </>
   );
}