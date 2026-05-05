import { supabase } from './supabaseClient'

// Cabang (Branch) operations
export const cabangService = {
  async getAll() {
    const { data, error } = await supabase.from('Cabang').select('*').order('nama')
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('Cabang').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(cabang: { nama: string; alamat?: string; telepon?: string }) {
    const { data, error } = await supabase.from('Cabang').insert(cabang).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, cabang: Partial<{ nama: string; alamat?: string; telepon?: string }>) {
    const { data, error } = await supabase.from('Cabang').update(cabang).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase.from('Cabang').delete().eq('id', id)
    if (error) throw error
  }
}

// User operations
export const userService = {
  async getAll() {
    const { data, error } = await supabase.from('User').select('*, Cabang!User_cabangId_fkey(*)').order('nama')
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('User').select('*, Cabang!User_cabangId_fkey(*)').eq('id', id).single()
    if (error) throw error
    return data
  },

  async getByUsername(username: string) {
    const { data, error } = await supabase.from('User').select('*, Cabang!User_cabangId_fkey(*)').eq('username', username).single()
    if (error) throw error
    return data
  },

  async create(user: { username: string; password: string; nama: string; role: string; cabangId?: string; avatar?: string }) {
    const { data, error } = await supabase.from('User').insert(user).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, user: Partial<{ username: string; password: string; nama: string; role: string; cabangId?: string; avatar?: string }>) {
    const { data, error } = await supabase.from('User').update(user).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase.from('User').delete().eq('id', id)
    if (error) throw error
  }
}

// BahanBaku (Raw Material) operations
export const bahanBakuService = {
  async getAll(cabangId?: string) {
    let query = supabase.from('BahanBaku').select('*, Cabang!BahanBaku_cabangId_fkey(*)').order('nama')
    if (cabangId) query = query.eq('cabangId', cabangId)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('BahanBaku').select('*, Cabang!BahanBaku_cabangId_fkey(*)').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(bahanBaku: { nama: string; rasa?: string; berat: number; stok: number; satuan?: string; gambar?: string; deskripsi?: string; jenisProduk?: string; cabangId: string }) {
    const { data, error } = await supabase.from('BahanBaku').insert(bahanBaku).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, bahanBaku: Partial<{ nama: string; rasa?: string; berat: number; stok: number; satuan?: string; gambar?: string; deskripsi?: string; jenisProduk?: string; cabangId: string }>) {
    const { data, error } = await supabase.from('BahanBaku').update(bahanBaku).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase.from('BahanBaku').delete().eq('id', id)
    if (error) throw error
  }
}

// Menu operations
export const menuService = {
  async getAll(cabangId?: string) {
    let query = supabase.from('Menu').select('*, Cabang!Menu_cabangId_fkey(*), Resep(*, BahanBaku!Resep_bahanBakuId_fkey(*))').order('nama')
    if (cabangId) query = query.eq('cabangId', cabangId)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('Menu').select('*, Cabang!Menu_cabangId_fkey(*), Resep(*, BahanBaku!Resep_bahanBakuId_fkey(*))').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(menu: { nama: string; kategori: string; harga: number; hargaBeli?: number; tersedia?: boolean; gambar?: string; deskripsi?: string; cabangId?: string }) {
    const { data, error } = await supabase.from('Menu').insert(menu).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, menu: Partial<{ nama: string; kategori: string; harga: number; hargaBeli?: number; tersedia?: boolean; gambar?: string; deskripsi?: string; cabangId?: string }>) {
    const { data, error } = await supabase.from('Menu').update(menu).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase.from('Menu').delete().eq('id', id)
    if (error) throw error
  }
}

// Transaksi (Transaction) operations
export const transaksiService = {
  async getAll() {
    const { data, error } = await supabase.from('Transaksi').select('*, User(*), CartItem(*)').order('tanggal', { ascending: false })
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('Transaksi').select('*, User(*), CartItem(*)').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(transaksi: {
    userId: string;
    subtotal: number;
    total: number;
    metodePembayaran: string;
    bayar: number;
    kembalian: number;
    catatan?: string;
    keterangan?: string;
    buktiPembayaran?: string;
    buktiPenjualan?: string;
    items: Array<{ menuId: string; nama: string; kategori: string; harga: number; jumlah: number }>
  }) {
    const { data: transaksiData, error: transaksiError } = await supabase
      .from('Transaksi')
      .insert({
        id: `TRX-${Date.now()}`,
        userId: transaksi.userId,
        subtotal: transaksi.subtotal,
        total: transaksi.total,
        metodePembayaran: transaksi.metodePembayaran,
        bayar: transaksi.bayar,
        kembalian: transaksi.kembalian,
        catatan: transaksi.catatan,
        keterangan: transaksi.keterangan,
        buktiPembayaran: transaksi.buktiPembayaran,
        buktiPenjualan: transaksi.buktiPenjualan,
      })
      .select()
      .single()
    
    if (transaksiError) throw transaksiError

    if (transaksi.items.length > 0) {
      const cartItems = transaksi.items.map((item, index) => ({
        id: `CI-${Date.now()}-${index}`,
        transaksiId: transaksiData.id,
        menuId: item.menuId,
        nama: item.nama,
        kategori: item.kategori,
        harga: item.harga,
        jumlah: item.jumlah
      }))

      const { error: itemsError } = await supabase.from('CartItem').insert(cartItems)
      if (itemsError) throw itemsError
    }

    return transaksiData
  }
}
