export type UserRole = "ADMIN" | "KASIR";

export type MetodePembayaran = "TUNAI" | "QUIRZ";

export interface Cabang {
  id: string;
  nama: string;
  alamat?: string;
  telepon?: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  nama: string;
  role: UserRole;
  cabangId?: string;
  cabang?: Cabang;
  createdAt: string;
  avatar?: string;
}

export interface Produk {
  id: string;
  nama: string;
  rasa?: string;
  berat?: number;
  harga: number;
  hargaBeli?: number | null;
  stok: number;
  gambar?: string;
  deskripsi?: string;
  kategori?: string;
  tersedia?: boolean;
  createdAt?: string;
  cabangId?: string;
  cabang?: Cabang;
}

export interface CartItem extends Produk {
  jumlah: number;
}

export interface Transaksi {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  metodePembayaran: MetodePembayaran;
  bayar: number;
  kembalian: number;
  catatan?: string;
  keterangan?: string;
  buktiPembayaran?: string;
  tanggal: string;
}

export interface GrafikData {
  tanggal: string;
  penjualan: number;
  laba: number;
}
