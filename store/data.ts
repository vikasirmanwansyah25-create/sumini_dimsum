import { create } from "zustand";

interface Cabang {
  id: string;
  nama: string;
  alamat?: string;
  telepon?: string;
  createdAt: string;
  bahanBaku?: any[];
}

interface BahanBaku {
  id: string;
  nama: string;
  rasa?: string;
  berat: number;
  stok: number;
  satuan: string;
  gambar?: string;
  deskripsi?: string;
  jenisProduk: string;
  cabangId: string;
  cabang?: Cabang;
  createdAt: string;
}

interface Menu {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  hargaBeli?: number | null;
  tersedia: boolean;
  gambar?: string;
  deskripsi?: string;
  cabangId?: string;
  cabang?: Cabang;
  createdAt: string;
}

interface Resep {
  id: string;
  menuId: string;
  bahanBakuId: string;
  jumlah: number;
  bahanBaku?: BahanBaku;
  menu?: Menu;
}

interface TransaksiItem {
  id: string;
  transaksiId: string;
  menuId: string;
  nama: string;
  kategori: string;
  harga: number;
  jumlah: number;
  menu?: Menu;
}

interface Transaksi {
  id: string;
  userId: string;
  user?: any;
  subtotal: number;
  total: number;
  metodePembayaran: string;
  bayar: number;
  kembalian: number;
  catatan?: string;
  keterangan?: string;
  buktiPembayaran?: string;
  buktiPenjualan?: string;
  tanggal: string;
  items: TransaksiItem[];
}

interface DataState {
  cabangList: Cabang[];
  bahanBakuList: BahanBaku[];
  menuList: Menu[];
  resepList: Resep[];
  transaksiList: Transaksi[];
  
  // Cabang actions
  getCabang: () => Cabang[];
  addCabang: (data: Omit<Cabang, "id" | "createdAt" | "bahanBaku">) => Cabang;
  updateCabang: (id: string, data: Partial<Cabang>) => Cabang | null;
  deleteCabang: (id: string) => boolean;

  // Bahan Baku actions
  getBahanBaku: (cabangId?: string) => BahanBaku[];
  addBahanBaku: (data: Omit<BahanBaku, "id" | "createdAt">) => BahanBaku;
  updateBahanBaku: (id: string, data: Partial<BahanBaku>) => BahanBaku | null;
  deleteBahanBaku: (id: string) => boolean;

  // Menu actions
  getMenu: (cabangId?: string, all?: boolean) => Menu[];
  addMenu: (data: Omit<Menu, "id" | "createdAt">) => Menu;
  updateMenu: (id: string, data: Partial<Menu>) => Menu | null;
  deleteMenu: (id: string) => boolean;

  // Resep actions
  getResep: (menuId?: string) => Resep[];
  addResep: (data: Omit<Resep, "id">) => Resep;

  // Transaksi actions
  getTransaksi: (userId?: string, cabangId?: string) => Transaksi[];
  addTransaksi: (data: Omit<Transaksi, "id" | "tanggal"> & { items: { menuId: string; nama: string; kategori: string; harga: number; jumlah: number }[] }) => Transaksi;
  updateTransaksi: (id: string, data: Partial<Transaksi>) => Transaksi | null;
}

let idCounter = 1000;
const generateId = () => `gen-${++idCounter}-${Date.now()}`;

export const useDataStore = create<DataState>((set, get) => ({
  cabangList: [
    { id: "cabang-001", nama: "Cabang Pusat", alamat: "Jl. Raya Pusat No. 1", telepon: "021-1234567", createdAt: "2024-01-01T00:00:00Z" },
    { id: "cabang-002", nama: "Cabang Utara", alamat: "Jl. Utara No. 2", telepon: "021-7654321", createdAt: "2024-02-01T00:00:00Z" },
  ],
  bahanBakuList: [
    { id: "bb-001", nama: "Kulit Dimsum", rasa: "Original", berat: 150, stok: 50, satuan: "pcs", gambar: undefined, deskripsi: "Kulit dimsum premium", jenisProduk: "Makanan", cabangId: "cabang-001", createdAt: "2024-01-01T00:00:00Z" },
    { id: "bb-002", nama: "Isian Dimsum Ayam", rasa: "Ayam", berat: 200, stok: 35, satuan: "pcs", gambar: undefined, deskripsi: "Isian dimsum rasa ayam", jenisProduk: "Makanan", cabangId: "cabang-001", createdAt: "2024-01-01T00:00:00Z" },
    { id: "bb-003", nama: "Dimsum Udang", rasa: "Udang", berat: 180, stok: 15, satuan: "pcs", gambar: undefined, deskripsi: "Dimsum isi udang", jenisProduk: "Makanan", cabangId: "cabang-002", createdAt: "2024-01-01T00:00:00Z" },
  ],
  menuList: [
    { id: "menu-001", nama: "Dimsum Ayam Original", kategori: "Makanan", harga: 15000, hargaBeli: 8000, tersedia: true, gambar: undefined, deskripsi: "Dimsum ayam original", cabangId: undefined, createdAt: "2024-01-01T00:00:00Z" },
    { id: "menu-002", nama: "Dimsum Udang Spesial", kategori: "Makanan", harga: 20000, hargaBeli: 12000, tersedia: true, gambar: undefined, deskripsi: "Dimsum udang spesial", cabangId: undefined, createdAt: "2024-01-01T00:00:00Z" },
    { id: "menu-003", nama: "Es Teh Manis", kategori: "Minuman", harga: 5000, hargaBeli: 2000, tersedia: true, gambar: undefined, deskripsi: "Es teh manis segar", cabangId: undefined, createdAt: "2024-01-01T00:00:00Z" },
  ],
  resepList: [
    { id: "resep-001", menuId: "menu-001", bahanBakuId: "bb-001", jumlah: 2 },
    { id: "resep-002", menuId: "menu-001", bahanBakuId: "bb-002", jumlah: 3 },
    { id: "resep-003", menuId: "menu-002", bahanBakuId: "bb-003", jumlah: 2 },
  ],
  transaksiList: [],

  getCabang: () => get().cabangList,
  addCabang: (data) => {
    const newCabang: Cabang = { ...data, id: generateId(), createdAt: new Date().toISOString(), bahanBaku: [] };
    set((state) => ({ cabangList: [newCabang, ...state.cabangList] }));
    return newCabang;
  },
  updateCabang: (id, data) => {
    let updated: Cabang | null = null;
    set((state) => {
      updated = state.cabangList.find((c) => c.id === id) || null;
      if (!updated) return state;
      const updatedCabang = { ...updated, ...data };
      return { cabangList: state.cabangList.map((c) => (c.id === id ? updatedCabang : c)) };
    });
    return updated;
  },
  deleteCabang: (id) => {
    const exists = get().cabangList.some((c) => c.id === id);
    if (exists) set((state) => ({ cabangList: state.cabangList.filter((c) => c.id !== id) }));
    return exists;
  },

  getBahanBaku: (cabangId) => {
    const list = get().bahanBakuList;
    if (cabangId) return list.filter((b) => b.cabangId === cabangId);
    return list;
  },
  addBahanBaku: (data) => {
    const newBahan: BahanBaku = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    set((state) => ({ bahanBakuList: [newBahan, ...state.bahanBakuList] }));
    return newBahan;
  },
  updateBahanBaku: (id, data) => {
    let updated: BahanBaku | null = null;
    set((state) => {
      updated = state.bahanBakuList.find((b) => b.id === id) || null;
      if (!updated) return state;
      const updatedBahan = { ...updated, ...data };
      return { bahanBakuList: state.bahanBakuList.map((b) => (b.id === id ? updatedBahan : b)) };
    });
    return updated;
  },
  deleteBahanBaku: (id) => {
    const exists = get().bahanBakuList.some((b) => b.id === id);
    if (exists) set((state) => ({ bahanBakuList: state.bahanBakuList.filter((b) => b.id !== id) }));
    return exists;
  },

  getMenu: (cabangId, all) => {
    let list = get().menuList;
    if (!all) list = list.filter((m) => m.tersedia);
    if (cabangId) list = list.filter((m) => m.cabangId === cabangId || m.cabangId === null);
    return list;
  },
  addMenu: (data) => {
    const newMenu: Menu = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    set((state) => ({ menuList: [newMenu, ...state.menuList] }));
    return newMenu;
  },
  updateMenu: (id, data) => {
    let updated: Menu | null = null;
    set((state) => {
      updated = state.menuList.find((m) => m.id === id) || null;
      if (!updated) return state;
      const updatedMenu = { ...updated, ...data };
      return { menuList: state.menuList.map((m) => (m.id === id ? updatedMenu : m)) };
    });
    return updated;
  },
  deleteMenu: (id) => {
    const exists = get().menuList.some((m) => m.id === id);
    if (exists) set((state) => ({ menuList: state.menuList.filter((m) => m.id !== id) }));
    return exists;
  },

  getResep: (menuId) => {
    const list = get().resepList;
    if (menuId) return list.filter((r) => r.menuId === menuId);
    return list;
  },
  addResep: (data) => {
    const newResep: Resep = { ...data, id: generateId() };
    set((state) => ({ resepList: [newResep, ...state.resepList] }));
    return newResep;
  },

  getTransaksi: (userId, cabangId) => {
    let list = get().transaksiList;
    if (userId) list = list.filter((t) => t.userId === userId);
    return list;
  },
  addTransaksi: (data) => {
    const { items, ...rest } = data;
    const newTransaksi: Transaksi = {
      ...rest,
      id: `TRX-${Date.now()}`,
      tanggal: new Date().toISOString(),
      items: items.map((item, idx) => ({ ...item, id: generateId(), transaksiId: `TRX-${Date.now()}` })),
    };
    set((state) => ({ transaksiList: [newTransaksi, ...state.transaksiList] }));

    // Kurangi stok berdasarkan resep
    for (const item of items) {
      const reseps = get().resepList.filter((r) => r.menuId === item.menuId);
      for (const resep of reseps) {
        const bahanBaku = get().bahanBakuList.find((b) => b.id === resep.bahanBakuId);
        if (bahanBaku) {
          set((state) => ({
            bahanBakuList: state.bahanBakuList.map((b) =>
              b.id === resep.bahanBakuId ? { ...b, stok: b.stok - resep.jumlah * item.jumlah } : b
            ),
          }));
        }
      }
    }

    return newTransaksi;
  },
  updateTransaksi: (id, data) => {
    let updated: Transaksi | null = null;
    set((state) => {
      updated = state.transaksiList.find((t) => t.id === id) || null;
      if (!updated) return state;
      const updatedTransaksi = { ...updated, ...data };
      return { transaksiList: state.transaksiList.map((t) => (t.id === id ? updatedTransaksi : t)) };
    });
    return updated;
  },
}));
