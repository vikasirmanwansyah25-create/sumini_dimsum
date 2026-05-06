"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatDate, formatTime } from "@/lib/utils";
import { MetodePembayaran } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
import { Printer, CheckCircle2 } from "lucide-react";

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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup diblokir. Harap izinkan popup untuk mencetak struk.');
      return;
    }

    let itemsHTML = '';
    items.forEach(item => {
      itemsHTML += '<tr>';
      itemsHTML += '<td style="padding:5px 3px; font-size:10px; width:20px; font-weight:600;">' + item.jumlah + 'x</td>';
      itemsHTML += '<td style="padding:5px 3px; font-size:10px;">' + item.nama + '</td>';
      itemsHTML += '<td style="text-align:right; padding:5px 3px; font-size:10px; width:70px; font-weight:600;">' + formatRupiah(item.harga * item.jumlah) + '</td>';
      itemsHTML += '</tr>';
    });

    let receiptParts = [];
    receiptParts.push('<html><head><title>Struk</title><meta charset="utf-8">');
    receiptParts.push('<style>');
    receiptParts.push('*{margin:0;padding:0;box-sizing:border-box;}');
    receiptParts.push('body{font-family:"Courier New",Courier,monospace;font-size:10px;line-height:1.3;width:76mm;margin:0 auto;padding:2.5mm;color:#333;background:#fff;}');
    receiptParts.push('table{width:100%;border-collapse:collapse;}td{vertical-align:top;}');
    receiptParts.push('.center{text-align:center;}');
    receiptParts.push('.store-name{font-size:14px;font-weight:bold;margin-bottom:3px;color:#000;}');
    receiptParts.push('.store-info{font-size:9px;color:#555;margin-bottom:1px;}');
    receiptParts.push('.line{border-top:1px solid #333;margin:5px 0;height:0;}');
    receiptParts.push('.line-dashed{border-top:1px dashed #666;margin:6px 0;height:0;}');
    receiptParts.push('.info-table{font-size:9px;margin:5px 0;}');
    receiptParts.push('.info-table td{padding:1px 0;}');
    receiptParts.push('.label{color:#555;}');
    receiptParts.push('.total-line{border-top:2px solid #000;border-bottom:1px solid #000;padding:5px 0;margin-top:5px;font-weight:bold;font-size:11px;}');
    receiptParts.push('.pay-row{font-size:9px;padding:2px 0;display:flex;justify-content:space-between;}');
    receiptParts.push('.footer{margin-top:8px;padding-top:5px;border-top:1px solid #333;text-align:center;font-size:9px;color:#555;}');
    receiptParts.push('.thank-you{font-size:10px;font-weight:bold;margin-bottom:3px;}');
    receiptParts.push('@media print{body{padding:0;width:100%;background:white;}@page{margin:2mm;size:80mm auto;}}');
    receiptParts.push('</style></head><body>');

    // Simple, elegant header
    receiptParts.push('<div class="center" style="margin-bottom:5px;">');
    receiptParts.push('<div class="store-name">' + cabangNama.toUpperCase() + '</div>');
    if (cabangAlamat) receiptParts.push('<div class="store-info">' + cabangAlamat + '</div>');
    if (cabangTelepon) receiptParts.push('<div class="store-info">Telp: ' + cabangTelepon + '</div>');
    receiptParts.push('</div>');

    receiptParts.push('<div class="line"></div>');

    // Transaction Info - simple table
    receiptParts.push('<table class="info-table">');
    receiptParts.push('<tr><td class="label">No.</td><td style="text-align:right;">#' + transaksiId.slice(-8).toUpperCase() + '</td></tr>');
    receiptParts.push('<tr><td class="label">Tanggal</td><td style="text-align:right;">' + formatDate(tanggal) + '</td></tr>');
    receiptParts.push('<tr><td class="label">Waktu</td><td style="text-align:right;">' + formatTime(tanggal) + '</td></tr>');
    receiptParts.push('<tr><td class="label">Metode</td><td style="text-align:right;">' + metodeLabel[metodePembayaran] + '</td></tr>');
    receiptParts.push('</table>');

    receiptParts.push('<div class="line-dashed"></div>');

    // Items - simple list
    receiptParts.push('<table style="margin:5px 0;font-size:9px;">');
    receiptParts.push('<tr style="color:#555;border-bottom:1px dotted #999;"><td style="padding:2px;">Item</td><td style="text-align:center;padding:2px;">Qty</td><td style="text-align:right;padding:2px;">Subtotal</td></tr>');
    receiptParts.push(itemsHTML);
    receiptParts.push('</table>');

    receiptParts.push('<div class="line-dashed"></div>');

    // Total - bold and clear
    receiptParts.push('<div class="total-line">');
    receiptParts.push('<table style="width:100%;"><tr>');
    receiptParts.push('<td style="font-size:11px;">TOTAL</td>');
    receiptParts.push('<td style="text-align:right;font-size:12px;">' + formatRupiah(total) + '</td>');
    receiptParts.push('</tr></table>');
    receiptParts.push('</div>');

    // Payment Details
    receiptParts.push('<div style="margin-top:5px;">');
    receiptParts.push('<div class="pay-row"><span class="label">Bayar</span><span>' + formatRupiah(bayar) + '</span></div>');
    if (kembalian > 0) receiptParts.push('<div class="pay-row"><span class="label">Kembalian</span><span>' + formatRupiah(kembalian) + '</span></div>');
    receiptParts.push('</div>');

    if (catatan) {
      receiptParts.push('<div style="margin-top:5px;padding:4px;font-size:9px;border-top:1px dashed #999;">');
      receiptParts.push('<div style="font-weight:bold;margin-bottom:2px;">Catatan:</div>');
      receiptParts.push('<div>' + catatan + '</div>');
      receiptParts.push('</div>');
    }

    // Footer
    receiptParts.push('<div class="footer">');
    receiptParts.push('<div class="thank-you">~ Terima Kasih ~</div>');
    receiptParts.push('<div>Barang yang sudah dibeli</div>');
    receiptParts.push('<div>tidak dapat dikembalikan</div>');
    receiptParts.push('</div>');

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

           {/* Struk Preview - Sama dengan Cetakan */}
           <div className="px-6 pb-2 receipt-print-area">
             <div className="bg-white border border-slate-300 rounded-lg overflow-hidden print:border-0 print:rounded-none" style={{fontFamily: 'Courier New, Courier, monospace', fontSize: '10px'}}>
               {/* Header - Sama dengan Print */}
               <div className="text-center p-3 border-b border-slate-300">
                 <div className="font-bold text-sm text-slate-900">{cabangNama.toUpperCase()}</div>
                 {cabangAlamat && <div className="text-[9px] text-slate-600 mt-0.5">{cabangAlamat}</div>}
                 {cabangTelepon && <div className="text-[9px] text-slate-600">Telp: {cabangTelepon}</div>}
               </div>

               {/* Line */}
               <div className="mx-3 border-t border-slate-400"></div>

               {/* Info - Simple Rows */}
               <div className="px-3 py-2 space-y-0.5 text-[9px]">
                 <div className="flex justify-between">
                   <span className="text-slate-600">No.</span>
                   <span className="font-medium">#{transaksiId.slice(-8).toUpperCase()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-slate-600">Tanggal</span>
                   <span className="font-medium">{formatDate(tanggal)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-slate-600">Waktu</span>
                   <span className="font-medium">{formatTime(tanggal)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-slate-600">Metode</span>
                   <span className="font-medium">{metodeLabel[metodePembayaran]}</span>
                 </div>
               </div>

               {/* Dashed Line */}
               <div className="mx-3 border-t border-dashed border-slate-400"></div>

               {/* Items - Simple Table */}
               <div className="px-3 py-1">
                 <table className="w-full text-[9px]">
                   <thead>
                     <tr className="text-slate-500 border-b border-dotted border-slate-400">
                       <th className="text-left pb-1">Item</th>
                       <th className="text-center pb-1">Qty</th>
                       <th className="text-right pb-1">Subtotal</th>
                     </tr>
                   </thead>
                   <tbody>
                     {items.map((item, idx) => (
                       <tr key={`${item.id}-${idx}`}>
                         <td className="py-1">{item.nama}</td>
                         <td className="py-1 text-center font-semibold">{item.jumlah}x</td>
                         <td className="py-1 text-right font-semibold">{formatRupiah(item.harga * item.jumlah)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {/* Dashed Line */}
               <div className="mx-3 border-t border-dashed border-slate-400"></div>

               {/* Total - Bold */}
               <div className="mx-3 py-1.5 border-t-2 border-b border-slate-700">
                 <div className="flex justify-between font-bold text-[11px]">
                   <span>TOTAL</span>
                   <span>{formatRupiah(total)}</span>
                 </div>
               </div>

               {/* Payment */}
               <div className="px-3 py-1.5 space-y-0.5 text-[9px]">
                 <div className="flex justify-between">
                   <span className="text-slate-600">Bayar</span>
                   <span className="font-medium">{formatRupiah(bayar)}</span>
                 </div>
                 {kembalian > 0 && (
                   <div className="flex justify-between">
                     <span className="text-slate-600">Kembalian</span>
                     <span className="font-medium">{formatRupiah(kembalian)}</span>
                   </div>
                 )}
               </div>

               {/* Catatan */}
               {catatan && (
                 <div className="mx-3 mt-1 pt-1 border-t border-dashed border-slate-400 text-[9px]">
                   <div className="font-bold mb-0.5">Catatan:</div>
                   <div>{catatan}</div>
                 </div>
               )}

               {/* Footer */}
               <div className="text-center p-2 border-t border-slate-400 mt-1">
                 <div className="font-bold text-[10px] mb-0.5">~ Terima Kasih ~</div>
                 <div className="text-[9px] text-slate-600">Barang yang sudah dibeli</div>
                 <div className="text-[9px] text-slate-600">tidak dapat dikembalikan</div>
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
