"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { ProdukList, CartSidebar, CheckoutDialog, SuccessDialog } from "@/components/kasir";
import { MetodePembayaran } from "@/lib/types";

export default function CashierTransaksiPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);
  const [lastTransaksi, setLastTransaksi] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [filterKategori, setFilterKategori] = React.useState("Semua");

  const { currentUser } = useAuthStore();
  const { items, addItem, clearCart, getTotal } = useCartStore();

  const subtotal = getTotal();
  const total = subtotal;

  const handleAddItem = (menu: any) => {
    addItem(menu);
  };

  const handleCheckoutClick = () => {
    if (items.length === 0) {
      alert("Keranjang kosong!");
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleCheckout = async (
    metode: MetodePembayaran,
    bayar: number,
    kembalian: number,
    catatan?: string,
    keterangan?: string,
    buktiPembayaran?: string
  ) => {
    if (!currentUser?.id) {
      alert("User tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const transaksiId = `TRX-${Date.now()}`;
      // Gunakan waktu lokal WIB dengan format ISO yang mengandung offset +07:00
      const now = new Date();
      const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      // Format: 2026-05-07T08:51:00.000+07:00
      const wibISO = wibTime.toISOString().replace('Z', '+07:00');
      const payload = {
        userId: currentUser.id,
        items: items.map((item) => ({
          menuId: item.id,
          nama: item.nama,
          kategori: item.kategori || "Lainnya",
          harga: item.harga,
          jumlah: item.jumlah,
        })),
        subtotal,
        total,
        metodePembayaran: metode,
        bayar,
        kembalian,
        catatan,
        keterangan,
        buktiPembayaran,
        tanggal: wibISO,
      };

      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        alert("Gagal menyimpan transaksi: " + json.message);
        setLoading(false);
        return;
      }

      // Gunakan waktu sekarang (WIB) dari browser
      
      const transaksiData = {
        id: json.data.id,
        ...payload,
        items: items.map((item) => ({
          ...item,
          id: item.id,
        })),
        tanggal: now.toISOString(),
      };

      setLastTransaksi(transaksiData);

      setIsCheckoutOpen(false);
      setIsSuccessOpen(true);
      
      // Clear cart after success dialog has the data
      setTimeout(() => clearCart(), 0);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Terjadi kesalahan saat menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    setLastTransaksi(null);
  };

  return (
    <div className="flex gap-4 lg:gap-6 h-full">
      <div className="flex-1 space-y-4 lg:space-y-6 overflow-auto pb-20 lg:pb-0">
        <ProdukList
          filterKategori={filterKategori}
          onFilterChange={setFilterKategori}
          onAddItem={handleAddItem}
          cabangId={currentUser?.cabangId}
        />
      </div>

      <CartSidebar
        onCheckoutClick={handleCheckoutClick}
        onClearCart={handleClearCart}
      />

      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        items={items}
        subtotal={subtotal}
        total={total}
        onCheckout={handleCheckout}
      />

      {lastTransaksi && (
        <SuccessDialog
          open={isSuccessOpen}
          onOpenChange={handleSuccessClose}
          transaksiId={lastTransaksi.id}
          items={items.length > 0 ? items : lastTransaksi.items}
          subtotal={lastTransaksi.subtotal}
          total={lastTransaksi.total}
          metodePembayaran={lastTransaksi.metodePembayaran}
          bayar={lastTransaksi.bayar}
          kembalian={lastTransaksi.kembalian}
          catatan={lastTransaksi.catatan}
          tanggal={lastTransaksi.tanggal}
          cabangNama={currentUser?.cabang?.nama || ""}
          cabangAlamat={currentUser?.cabang?.alamat || ""}
          cabangTelepon={currentUser?.cabang?.telepon || ""}
        />
      )}
    </div>
  );
}
