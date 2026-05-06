// @ts-nocheck
"use client";

import * as React from "react";
import { FileText, TrendingUp, DollarSign, Calendar, Loader2, Eye, ImageIcon, X, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import * as XLSX from "xlsx";

export default function LaporanPage() {
  const [transaksi, setTransaksi] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTransaksi, setSelectedTransaksi] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/transaksi")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTransaksi(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);



  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleExportAll = () => {
    const data: any[] = [];
    transaksi.forEach((trx: any) => {
      trx.items.forEach((item: any, idx: number) => {
        data.push({
          "ID": idx === 0 ? trx.id.slice(-8).toUpperCase() : "",
          "Waktu": idx === 0 ? formatDateTime(trx.tanggal) : "",
          "Kasir": idx === 0 ? (trx.user?.cabang?.nama ?? "-") : "",
          "Item": item.nama,
          "Total Item": item.jumlah,
          "Harga Satuan": item.harga,
          "Subtotal": item.harga * item.jumlah,
          "Metode": idx === 0 ? (trx.metodePembayaran === "QUIRZ" ? "QRIS" : trx.metodePembayaran) : "",
          "Total Transaksi": idx === 0 ? trx.total : "",
        });
      });
    });
    exportToExcel(data, `Laporan_Semua_Cabang_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportCabang = (cabangId: string, cabangNama: string) => {
    const filtered = transaksi.filter((trx: any) => trx.user?.cabang?.id === cabangId);
    const data: any[] = [];
    
    filtered.forEach((trx: any) => {
      trx.items.forEach((item: any, idx: number) => {
        data.push({
          "ID": idx === 0 ? trx.id.slice(-8).toUpperCase() : "",
          "Waktu": idx === 0 ? formatDateTime(trx.tanggal) : "",
          "Item": item.nama,
          "Total Item": item.jumlah,
          "Harga Satuan": item.harga,
          "Subtotal": item.harga * item.jumlah,
          "Metode": idx === 0 ? (trx.metodePembayaran === "QUIRZ" ? "QRIS" : trx.metodePembayaran) : "",
          "Total Transaksi": idx === 0 ? trx.total : "",
        });
      });
    });

    exportToExcel(data, `Laporan_${cabangNama}_${new Date().toISOString().slice(0, 10)}`);
  };

  const cabangMap = new Map();
  transaksi.forEach((t) => {
    const cabang = t.user?.cabang;
    if (cabang && !cabangMap.has(cabang.id)) {
      cabangMap.set(cabang.id, cabang.nama);
    }
  });
  const cabangIds = Array.from(cabangMap.keys());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-muted-foreground">Memuat laporan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-charcoal-800">Laporan</h1>
        <p className="text-xs lg:text-sm text-charcoal-500">Riwayat transaksi & perhitungan laba rugi</p>
      </div>



      <Tabs defaultValue="semua">
        <TabsList className="bg-[#4B736A] text-white">
          <TabsTrigger value="semua" className="data-[state=active]:bg-white data-[state=active]:text-[#4B736A]">Semua Transaksi</TabsTrigger>
          {cabangIds.map((cid) => (
            <TabsTrigger key={cid} value={cid} className="data-[state=active]:bg-white data-[state=active]:text-[#4B736A]">{cabangMap.get(cid)}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="semua">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Riwayat Transaksi
                </div>
                <Button onClick={handleExportAll} size="sm" className="gap-2 bg-[#4A776E] hover:bg-[#4A776E]/90">
                  <Download className="h-4 w-4" />
                  Export Excel
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
               {transaksi.length === 0 ? (
                 <div className="text-center py-12">
                   <FileText className="h-12 w-12 mx-auto text-charcoal-300 mb-3" />
                   <p className="text-lg text-charcoal-500">Belum ada transaksi</p>
                 </div>
               ) : (
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>ID</TableHead>
                       <TableHead>Tanggal & Waktu</TableHead>
                       <TableHead>Kasir</TableHead>
                       <TableHead>Item</TableHead>
                       <TableHead>Total Item</TableHead>
                       <TableHead>Total</TableHead>
                       <TableHead>Metode</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead className="text-right">Aksi</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {transaksi.map((trx) => (
                       <TableRow key={trx.id}>
                         <TableCell className="font-medium">#{trx.id.slice(-6).toUpperCase()}</TableCell>
                         <TableCell>
                           <p>{formatDateTime(trx.tanggal)}</p>
                         </TableCell>
                         <TableCell>{trx.user?.cabang?.nama ?? "-"}</TableCell>
                         <TableCell>
                           <div className="flex flex-wrap gap-1">
                             {trx.items.slice(0, 2).map((item, idx) => (
                               <Badge key={idx} variant="secondary">{item.nama}</Badge>
                             ))}
                             {trx.items.length > 2 && <Badge variant="outline">+{trx.items.length - 2}</Badge>}
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex flex-wrap gap-1">
                             {trx.items.slice(0, 2).map((item, idx) => (
                               <Badge key={idx} variant="outline">{item.jumlah}x</Badge>
                             ))}
                             {trx.items.length > 2 && <Badge variant="outline">+{trx.items.length - 2}</Badge>}
                           </div>
                         </TableCell>
                         <TableCell className="font-medium">{formatRupiah(trx.total)}</TableCell>
                         <TableCell>
                           <div className="flex items-center gap-1">
                             <Badge variant="outline">{trx.metodePembayaran}</Badge>
                             {trx.buktiPembayaran && (
                               <ImageIcon className="h-3.5 w-3.5 text-amber-500" />
                             )}
                           </div>
                         </TableCell>
                         <TableCell>
                           <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Selesai</Badge>
                         </TableCell>
                         <TableCell className="text-right">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => setSelectedTransaksi(trx)}
                             className="h-8 w-8 p-0"
                           >
                             <Eye className="h-4 w-4 text-slate-500" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               )}
            </CardContent>
          </Card>
        </TabsContent>

         {cabangIds.map((cid) => (
           <TabsContent key={cid} value={cid}>
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center justify-between">
                   <span>Transaksi {cabangMap.get(cid)}</span>
                   <Button onClick={() => handleExportCabang(cid, cabangMap.get(cid))} size="sm" className="gap-2 bg-[#4A776E] hover:bg-[#4A776E]/90">
                     <Download className="h-4 w-4" />
                     Export Excel
                   </Button>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>ID</TableHead>
                       <TableHead>Tanggal & Waktu</TableHead>
                       <TableHead>Item</TableHead>
                       <TableHead>Total Item</TableHead>
                       <TableHead>Total</TableHead>
                       <TableHead>Metode</TableHead>
                       <TableHead className="text-right">Aksi</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {transaksi.filter((trx) => trx.user?.cabang?.id === cid).map((trx) => (
                       <TableRow key={trx.id}>
                         <TableCell className="font-medium">#{trx.id.slice(-6).toUpperCase()}</TableCell>
                         <TableCell>{formatDateTime(trx.tanggal)}</TableCell>
                         <TableCell>
                           <div className="flex flex-wrap gap-1">
                             {trx.items.slice(0, 2).map((item, idx) => (
                               <Badge key={idx} variant="secondary">{item.nama}</Badge>
                             ))}
                             {trx.items.length > 2 && <Badge variant="outline">+{trx.items.length - 2}</Badge>}
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex flex-wrap gap-1">
                             {trx.items.slice(0, 2).map((item, idx) => (
                               <Badge key={idx} variant="outline">{item.jumlah}x</Badge>
                             ))}
                             {trx.items.length > 2 && <Badge variant="outline">+{trx.items.length - 2}</Badge>}
                           </div>
                         </TableCell>
                         <TableCell className="font-medium">{formatRupiah(trx.total)}</TableCell>
                         <TableCell>
                           <div className="flex items-center gap-1">
                             <Badge variant="outline">{trx.metodePembayaran}</Badge>
                             {trx.buktiPembayaran && (
                               <ImageIcon className="h-3.5 w-3.5 text-amber-500" />
                             )}
                           </div>
                         </TableCell>
                         <TableCell className="text-right">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => setSelectedTransaksi(trx)}
                             className="h-8 w-8 p-0"
                           >
                             <Eye className="h-4 w-4 text-slate-500" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </CardContent>
             </Card>
           </TabsContent>
         ))}
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedTransaksi} onOpenChange={() => setSelectedTransaksi(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detail Transaksi #{selectedTransaksi?.id.slice(-6).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedTransaksi && (
            <div className="space-y-4">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                 <div>
                   <p className="text-slate-500">Tanggal & Waktu</p>
                   <p className="font-medium">{formatDateTime(selectedTransaksi.tanggal)}</p>
                 </div>
                <div>
                  <p className="text-slate-500">Kasir</p>
                  <p className="font-medium">{selectedTransaksi.user?.cabang?.nama ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Metode</p>
                  <Badge variant="outline">{selectedTransaksi.metodePembayaran}</Badge>
                </div>
                <div>
                  <p className="text-slate-500">Total</p>
                  <p className="font-bold text-amber-600">{formatRupiah(selectedTransaksi.total)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border rounded-xl divide-y divide-slate-50">
                {selectedTransaksi.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center px-3 py-2">
                    <div>
                      <p className="font-medium text-sm">{item.nama}</p>
                      <p className="text-xs text-slate-500">{item.jumlah} × {formatRupiah(item.harga)}</p>
                    </div>
                    <span className="font-semibold text-sm">{formatRupiah(item.harga * item.jumlah)}</span>
                  </div>
                ))}
                <div className="px-3 py-2 bg-slate-50 flex justify-between font-bold text-sm">
                  <span>Total</span>
                  <span className="text-amber-600">{formatRupiah(selectedTransaksi.total)}</span>
                </div>
              </div>

              {/* Keterangan */}
              {selectedTransaksi.keterangan && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Keterangan</p>
                  <p className="text-sm text-slate-700">{selectedTransaksi.keterangan}</p>
                </div>
              )}

              {/* Bukti Pembayaran */}
              {selectedTransaksi.buktiPembayaran && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Bukti Pembayaran</p>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <img
                      src={selectedTransaksi.buktiPembayaran}
                      alt="Bukti pembayaran"
                      className="w-full max-h-80 object-contain bg-slate-50"
                    />
                  </div>
                </div>
              )}

              {/* Catatan */}
              {selectedTransaksi.catatan && (
                <div className="text-xs text-slate-500">
                  <span className="font-medium">Catatan:</span> {selectedTransaksi.catatan}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

