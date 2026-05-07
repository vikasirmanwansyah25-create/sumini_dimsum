"use client";

import * as React from "react";
import { Clock, FileText, Loader2, Eye, ImageIcon, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/store/auth";
import { formatRupiah, formatTime, formatDate, formatDateTime } from "@/lib/utils";

interface CartItemData {
  id: string;
  nama: string;
  rasa: string;
  jumlah: number;
  harga: number;
}

interface TransaksiData {
  id: string;
  userId: string;
  items: CartItemData[];
  total: number;
  metodePembayaran: string;
  tanggal: string;
  keterangan?: string;
  buktiPembayaran?: string;
}

export default function RiwayatPage() {
  const { currentUser } = useAuthStore();
  const [transaksi, setTransaksi] = React.useState<TransaksiData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTransaksi, setSelectedTransaksi] = React.useState<TransaksiData | null>(null);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/transaksi")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const userTrx = json.data.filter((trx: TransaksiData) => trx.userId === currentUser?.id);
          setTransaksi(userTrx);
        }
      })
      .catch((err) => console.error("Fetch riwayat error:", err))
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  const totalTransaksi = transaksi.length;
  const totalPenjualan = transaksi.reduce((sum, trx) => sum + (trx.total || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 lg:py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-muted-foreground text-sm lg:text-base">Memuat riwayat transaksi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-charcoal-800">Riwayat Transaksi</h1>
        <p className="text-xs lg:text-sm text-charcoal-500">Riwayat transaksi yang Anda lakukan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 bg-navy-100 rounded-xl">
                <FileText className="h-4 lg:h-6 w-4 lg:w-6 text-navy-700" />
              </div>
              <div>
                <p className="text-xs lg:text-sm text-charcoal-500">Total Transaksi</p>
                <p className="text-xl lg:text-2xl font-bold">{totalTransaksi}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 bg-green-100 rounded-xl">
                <Clock className="h-4 lg:h-6 w-4 lg:w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm text-charcoal-500">Total Penjualan</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">{formatRupiah(totalPenjualan)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm lg:text-base">Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {transaksi.length === 0 ? (
            <div className="text-center py-10 lg:py-12">
              <Clock className="h-10 lg:h-12 w-10 lg:w-12 mx-auto text-charcoal-300 mb-2 lg:3" />
              <p className="text-sm lg:text-lg text-charcoal-500">Belum ada transaksi</p>
              <p className="text-xs lg:text-sm text-charcoal-400 mt-1">
                Transaksi Anda akan muncul di sini setelah checkout
              </p>
            </div>
          ) : (
            [
              <div key="table" className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tanggal & Waktu</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Total Item</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Lihat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaksi.map((trx) => (
                      <TableRow key={trx.id}>
                        <TableCell className="font-medium">#{trx.id.slice(-6).toUpperCase()}</TableCell>
                        <TableCell>{formatDateTime(trx.tanggal)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {trx.items.slice(0, 3).map((item, idx) => (
                              <Badge key={idx} variant="secondary">{item.nama}</Badge>
                            ))}
                            {trx.items.length > 3 && (
                              <Badge variant="outline">+{trx.items.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {trx.items.slice(0, 3).map((item, idx) => (
                              <Badge key={idx} variant="secondary">{item.jumlah}x</Badge>
                            ))}
                            {trx.items.length > 3 && (
                              <Badge variant="outline">+{trx.items.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatRupiah(trx.total)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">{trx.metodePembayaran === "QUIRZ" ? "QRIS" : trx.metodePembayaran}</Badge>
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
              </div>
            ]
          )}
        </CardContent>
      </Card>

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
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Tanggal</p>
                  <p className="font-medium">{formatDateTime(selectedTransaksi.tanggal)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Metode</p>
                  <Badge variant="outline">{selectedTransaksi?.metodePembayaran === "QUIRZ" ? "QRIS" : selectedTransaksi?.metodePembayaran}</Badge>
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
                  <button
                    onClick={() => setPreviewImage(selectedTransaksi.buktiPembayaran!)}
                    className="w-full rounded-xl border border-slate-200 overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={selectedTransaksi.buktiPembayaran}
                      alt="Bukti pembayaran"
                      className="w-full max-h-80 object-contain bg-slate-50"
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-2">
          <DialogHeader className="px-4 pt-2">
            <DialogTitle className="text-sm">Preview Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview bukti pembayaran"
              className="w-full object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

