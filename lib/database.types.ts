export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password: string
          nama: string
          role: string
          cabang_id: string | null
          created_at: string
          avatar: string | null
        }
        Insert: {
          id?: string
          username: string
          password: string
          nama: string
          role: string
          cabang_id?: string | null
          created_at?: string
          avatar?: string | null
        }
        Update: {
          id?: string
          username?: string
          password?: string
          nama?: string
          role?: string
          cabang_id?: string | null
          created_at?: string
          avatar?: string | null
        }
      }
      cabang: {
        Row: {
          id: string
          nama: string
          alamat: string | null
          telepon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nama: string
          alamat?: string | null
          telepon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          alamat?: string | null
          telepon?: string | null
          created_at?: string
        }
      }
      bahan_baku: {
        Row: {
          id: string
          nama: string
          rasa: string | null
          berat: number
          stok: number
          satuan: string
          gambar: string | null
          deskripsi: string | null
          jenis_produk: string
          cabang_id: string
          created_at: string
        }
        Insert: {
          id?: string
          nama: string
          rasa?: string | null
          berat: number
          stok: number
          satuan?: string
          gambar?: string | null
          deskripsi?: string | null
          jenis_produk?: string
          cabang_id: string
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          rasa?: string | null
          berat?: number
          stok?: number
          satuan?: string
          gambar?: string | null
          deskripsi?: string | null
          jenis_produk?: string
          cabang_id?: string
          created_at?: string
        }
      }
      menu: {
        Row: {
          id: string
          nama: string
          kategori: string
          harga: number
          harga_beli: number | null
          tersedia: boolean
          gambar: string | null
          deskripsi: string | null
          created_at: string
          cabang_id: string | null
        }
        Insert: {
          id?: string
          nama: string
          kategori: string
          harga: number
          harga_beli?: number | null
          tersedia?: boolean
          gambar?: string | null
          deskripsi?: string | null
          created_at?: string
          cabang_id?: string | null
        }
        Update: {
          id?: string
          nama?: string
          kategori?: string
          harga?: number
          harga_beli?: number | null
          tersedia?: boolean
          gambar?: string | null
          deskripsi?: string | null
          created_at?: string
          cabang_id?: string | null
        }
      }
      resep: {
        Row: {
          id: string
          menu_id: string
          bahan_baku_id: string
          jumlah: number
        }
        Insert: {
          id?: string
          menu_id: string
          bahan_baku_id: string
          jumlah: number
        }
        Update: {
          id?: string
          menu_id?: string
          bahan_baku_id?: string
          jumlah?: number
        }
      }
      transaksi: {
        Row: {
          id: string
          user_id: string
          subtotal: number
          total: number
          metode_pembayaran: string
          bayar: number
          kembalian: number
          catatan: string | null
          keterangan: string | null
          bukti_pembayaran: string | null
          bukti_penjualan: string | null
          tanggal: string
        }
        Insert: {
          id?: string
          user_id: string
          subtotal: number
          total: number
          metode_pembayaran: string
          bayar: number
          kembalian: number
          catatan?: string | null
          keterangan?: string | null
          bukti_pembayaran?: string | null
          bukti_penjualan?: string | null
          tanggal?: string
        }
        Update: {
          id?: string
          user_id?: string
          subtotal?: number
          total?: number
          metode_pembayaran?: string
          bayar?: number
          kembalian?: number
          catatan?: string | null
          keterangan?: string | null
          bukti_pembayaran?: string | null
          bukti_penjualan?: string | null
          tanggal?: string
        }
      }
      cart_item: {
        Row: {
          id: string
          transaksi_id: string
          menu_id: string
          nama: string
          kategori: string
          harga: number
          jumlah: number
          harga_beli: number | null
        }
        Insert: {
          id?: string
          transaksi_id: string
          menu_id: string
          nama: string
          kategori: string
          harga: number
          jumlah: number
          harga_beli?: number | null
        }
        Update: {
          id?: string
          transaksi_id?: string
          menu_id?: string
          nama?: string
          kategori?: string
          harga?: number
          jumlah?: number
          harga_beli?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
