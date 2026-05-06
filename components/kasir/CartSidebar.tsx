"use client";

import * as React from "react";
import { Plus, Minus, Trash2, ShoppingCart, Receipt, Package, ShoppingBag, X, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { formatRupiah } from "@/lib/utils";

interface CartSidebarProps {
  onCheckoutClick: () => void;
  onClearCart: () => void;
}

export function CartSidebar({ onCheckoutClick, onClearCart }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const [mobileCartOpen, setMobileCartOpen] = React.useState(false);

  const subtotal = getTotal();
  const total = subtotal;
  const totalItems = items.reduce((sum, item) => sum + item.jumlah, 0);

  const handleOpenCart = () => {
    if (items.length > 0) {
      setMobileCartOpen(true);
    } else {
      onCheckoutClick();
    }
  };

  return (
    <>
      {/* Mobile: Floating Cart Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={handleOpenCart}
          className="flex items-center gap-2 px-4 py-3 bg-[#4A776E] text-white rounded-full shadow-lg"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="bg-red-500 text-white">{totalItems}</Badge>
          )}
        </button>
      </div>

      {/* Mobile: Cart Panel Overlay */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileCartOpen(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Cart Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-slate-600" />
                <h2 className="font-semibold text-slate-800">Keranjang ({totalItems})</h2>
              </div>
              <button
                onClick={() => setMobileCartOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Mobile Cart Items */}
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <ShoppingBag className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-600 font-medium">Keranjang Kosong</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-lg">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {item.gambar ? (
                        <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800">{item.nama}</p>
                      <p className="text-xs text-slate-500">{item.kategori}</p>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{formatRupiah(item.harga)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.jumlah - 1)}
                          className="w-5 h-5 flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.jumlah}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.jumlah + 1)}
                          className="w-5 h-5 flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mobile Cart Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-slate-800">{formatRupiah(total)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClearCart();
                      setMobileCartOpen(false);
                    }}
                    className="flex-1 h-10 text-sm text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg"
                  >
                    Bersihkan
                  </button>
                  <button
                    onClick={() => {
                      setMobileCartOpen(false);
                      onCheckoutClick();
                    }}
                    className="flex-[2] h-10 bg-[#4A776E] hover:bg-[#4A776E]/90 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    Checkout
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop: Full Cart Sidebar */}
      <div className="hidden lg:block w-[380px] flex-shrink-0">
        <div className="sticky top-0 h-[calc(100vh-4.5rem)] flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-slate-600" />
                <h2 className="font-semibold text-slate-800">Keranjang</h2>
              </div>
              {items.length > 0 && (
                <Badge variant="secondary">{totalItems} item</Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <ShoppingBag className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">Keranjang Kosong</p>
                <p className="text-xs text-slate-400 text-center mt-1">
                  Klik produk untuk menambahkan
                </p>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-auto p-3 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-2 bg-white border border-slate-100 rounded-lg hover:border-slate-200">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {item.gambar ? (
                          <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-800 truncate">{item.nama}</p>
                        <p className="text-xs text-slate-500">{item.kategori}</p>
                        {item.deskripsi && (
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.deskripsi}</p>
                        )}
                        <p className="text-xs text-slate-600 mt-1 font-medium">{formatRupiah(item.harga)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 rounded hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.jumlah - 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.jumlah}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.jumlah + 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span className="text-slate-800">{formatRupiah(total)}</span>
                  </div>
                  <button
                    onClick={onCheckoutClick}
                    className="w-full h-10 bg-[#4A776E] hover:bg-[#4A776E]/90 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Receipt className="h-4 w-4" />
                    Checkout
                  </button>
                  <button
                    onClick={onClearCart}
                    className="w-full h-8 text-sm text-slate-400 hover:text-red-500 flex items-center justify-center"
                  >
                    Bersihkan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
