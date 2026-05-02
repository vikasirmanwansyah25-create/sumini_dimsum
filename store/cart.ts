import { create } from "zustand";
import { Produk } from "@/lib/types";

interface CartItem extends Produk {
  jumlah: number;
}

interface CartState {
  items: CartItem[];
  addItem: (menu: Produk) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, jumlah: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (menu: Produk) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === menu.id);

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === menu.id
              ? { ...item, jumlah: item.jumlah + 1 }
              : item
          ),
        };
      }

      return {
        items: [...state.items, { ...menu, jumlah: 1 }],
      };
    });
  },

  removeItem: (menuId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== menuId),
    }));
  },

  updateQuantity: (menuId: string, jumlah: number) => {
    if (jumlah <= 0) {
      get().removeItem(menuId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.id === menuId ? { ...item, jumlah } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.harga * item.jumlah,
      0
    );
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.jumlah, 0);
  },
}));