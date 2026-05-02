"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { MetodePembayaran, CartItem } from "@/lib/types";
import {
  Banknote,
  Landmark,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Receipt,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  subtotal: number;
  total: number;
  onCheckout: (
    metode: MetodePembayaran,
    bayar: number,
    kembalian: number,
    catatan?: string,
    keterangan?: string,
    buktiPembayaran?: string
  ) => void;
}

const metodePembayaranOptions: {
  value: MetodePembayaran;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    value: "TUNAI",
    label: "Tunai",
    icon: <Banknote className="h-5 w-5" />,
    desc: "Bayar dengan uang tunai",
  },
  {
    value: "TRANSFER",
    label: "Transfer",
    icon: <Landmark className="h-5 w-5" />,
    desc: "Transfer bank",
  },
];

const bankOptions = [
  { nama: "BCA", rekening: "1234-5678-9012", atasNama: "PT Keripik Pisang" },
  { nama: "BRI", rekening: "9876-5432-1098", atasNama: "PT Keripik Pisang" },
  { nama: "Mandiri", rekening: "4567-8901-2345", atasNama: "PT Keripik Pisang" },
];

export function CheckoutDialog({
  open,
  onOpenChange,
  items,
  subtotal,
  total,
  onCheckout,
}: CheckoutDialogProps) {
  const [metode, setMetode] = React.useState<MetodePembayaran>("TUNAI");
  const [bayarAmount, setBayarAmount] = React.useState("");
  const [selectedBank, setSelectedBank] = React.useState(bankOptions[0]);
  const [catatan, setCatatan] = React.useState("");
  const [keterangan, setKeterangan] = React.useState("");
  const [buktiPembayaran, setBuktiPembayaran] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<"ringkasan" | "pembayaran">("ringkasan");

  const kembalian = parseInt(bayarAmount || "0") - total;

  React.useEffect(() => {
    if (open) {
      setMetode("TUNAI");
      setBayarAmount("");
      setCatatan("");
      setKeterangan("");
      setBuktiPembayaran(null);
      setStep("ringkasan");
    }
  }, [open]);

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
      setBuktiPembayaran(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeBukti = () => {
    setBuktiPembayaran(null);
  };

  const handleBayar = () => {
    if (metode === "TUNAI") {
      if (kembalian < 0) {
        alert("Jumlah bayar kurang dari total!");
        return;
      }
      onCheckout(metode, parseInt(bayarAmount || "0"), Math.max(0, kembalian), catatan, keterangan || undefined);
    } else if (metode === "TRANSFER") {
      if (!buktiPembayaran) {
        alert("Harap upload bukti pembayaran!");
        return;
      }
      onCheckout(metode, total, 0, catatan, keterangan || undefined, buktiPembayaran);
    }
  };

  const isBayarValid = () => {
    if (metode === "TUNAI") return kembalian >= 0 && bayarAmount !== "";
    if (metode === "TRANSFER") return !!buktiPembayaran;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-slate-200">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            {step === "pembayaran" && (
              <button
                onClick={() => setStep("ringkasan")}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-slate-500" />
              </button>
            )}
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {step === "ringkasan" ? "Ringkasan Pesanan" : "Pembayaran"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          {step === "ringkasan" ? (
            <div className="space-y-5">
              {/* Items */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{items.length} Produk</span>
                </div>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 bg-white">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {item.gambar ? (
                            <img
                              src={item.gambar}
                              alt={item.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-500">
                              {item.jumlah}x
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            {item.nama}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatRupiah(item.harga)} / pcs
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm text-slate-700">
                        {formatRupiah(item.harga * item.jumlah)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-700">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-200">
                  <span className="text-slate-900">Total Bayar</span>
                  <span className="text-[#4A776E]">{formatRupiah(total)}</span>
                </div>
              </div>

              <Button
                className="w-full h-11 text-sm font-semibold bg-[#4A776E] hover:bg-[#4A776E]/90 text-white"
                onClick={() => setStep("pembayaran")}
              >
                Lanjut ke Pembayaran
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Metode */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {metodePembayaranOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMetode(opt.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        metode === opt.value
                          ? "border-charcoal-800 bg-charcoal-50/50"
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div
                        className={`${
                          metode === opt.value ? "text-[#4A776E]" : "text-slate-400"
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">{opt.label}</p>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Bayar Badge */}
              <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[#4A776E]" />
                  <span className="text-sm font-medium text-slate-700">Total Bayar</span>
                </div>
                <span className="text-lg font-bold text-[#4A776E]">
                  {formatRupiah(total)}
                </span>
              </div>

              {/* Form Metode */}
              {metode === "TUNAI" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Jumlah Uang Diterima
                    </label>
                    <Input
                      type="number"
                      value={bayarAmount}
                      onChange={(e) => setBayarAmount(e.target.value)}
                      placeholder="Masukkan jumlah uang"
                      className="h-11 text-base border-slate-200 focus-visible:ring-[#4A776E]"
                    />
                  </div>
                  {bayarAmount && kembalian >= 0 && (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                      <p className="text-xs text-emerald-600 font-medium">Kembalian</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {formatRupiah(kembalian)}
                      </p>
                    </div>
                  )}
                  {bayarAmount && kembalian < 0 && (
                    <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                      <p className="text-xs text-rose-600 font-medium">Kurang</p>
                      <p className="text-xl font-bold text-rose-600">
                        {formatRupiah(Math.abs(kembalian))}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {[total, 50000, 100000, 150000, 200000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setBayarAmount(amount.toString())}
                        className={`text-xs h-8 ${
                          bayarAmount === amount.toString()
                            ? "border-[#4A776E] bg-[#4A776E]/10 text-[#4A776E]"
                            : "border-slate-200"
                        }`}
                      >
                        {formatRupiah(amount)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {metode === "TRANSFER" && (
                <div className="space-y-4">
                  {/* Bank Info */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Pilih Bank
                    </label>
                    {bankOptions.map((bank) => (
                      <button
                        key={bank.nama}
                        onClick={() => setSelectedBank(bank)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                          selectedBank.nama === bank.nama
                            ? "border-charcoal-800 bg-charcoal-50/50"
                            : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <Landmark className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-sm text-slate-900">
                              {bank.nama}
                            </p>
                            <p className="text-xs text-slate-500">
                              {bank.rekening} a.n {bank.atasNama}
                            </p>
                          </div>
                        </div>
                        {selectedBank.nama === bank.nama && (
                          <Badge className="bg-charcoal-800 text-white text-[10px]">
                            Terpilih
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Upload Bukti */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Bukti Pembayaran <span className="text-rose-500">*</span>
                    </label>
                    {buktiPembayaran ? (
                      <div className="relative rounded-xl border border-slate-200 overflow-hidden">
                        <img
                          src={buktiPembayaran}
                          alt="Bukti pembayaran"
                          className="w-full h-48 object-contain bg-slate-50"
                        />
                        <button
                          onClick={removeBukti}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#4A776E] hover:bg-[#4A776E]/10/30 transition-all cursor-pointer">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500">
                            <span className="font-medium text-[#4A776E]">Klik untuk upload</span> atau drag & drop
                          </p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG (max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Keterangan */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Keterangan <span className="text-slate-400">(opsional)</span>
                    </label>
                    <Textarea
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Contoh: Transfer dari BCA, nama pengirim Budi..."
                      className="min-h-[80px] border-slate-200 focus-visible:ring-[#4A776E] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Catatan */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Catatan (opsional)
                </label>
                <Input
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Tambahkan catatan..."
                  className="h-10 border-slate-200 focus-visible:ring-[#4A776E]"
                />
              </div>
            </div>
          )}
        </div>

        {step === "pembayaran" && (
          <DialogFooter className="px-6 pb-6 pt-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("ringkasan")}
              className="border-slate-200"
            >
              Kembali
            </Button>
            <Button
              onClick={handleBayar}
              disabled={!isBayarValid()}
              className="min-w-[120px] bg-[#4A776E] hover:bg-[#4A776E]/90 text-white"
            >
              Bayar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}