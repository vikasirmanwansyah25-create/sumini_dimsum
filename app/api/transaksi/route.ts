import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cabangId = url.searchParams.get("cabangId");

    let query = supabase
      .from('Transaksi')
      .select('*, items:CartItem(*), user:User!userId(*, cabang:Cabang!cabangId(*))')
      .order('tanggal', { ascending: false });

    if (cabangId) {
      const { data: users } = await supabase
        .from('User')
        .select('id')
        .eq('cabangId', cabangId);

      if (users && users.length > 0) {
        const userIds = users.map(u => u.id);
        query = query.in('userId', userIds);
      }
    }

    const { data: transaksi, error } = await query;

    if (error) throw error;
    return NextResponse.json({ success: true, data: transaksi });
  } catch (error) {
    console.error("GET /api/transaksi error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data transaksi" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      items,
      subtotal,
      total,
      metodePembayaran,
      bayar,
      kembalian,
      catatan,
      keterangan,
      buktiPembayaran,
      tanggal,
    } = body;

    console.log("Received payload:", JSON.stringify(body, null, 2));

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "items is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    const transaksiData: any = {
      id: `TRX-${Date.now()}`,
      userId: userId,
      tanggal: tanggal || new Date().toISOString(),
      subtotal: Number(subtotal),
      total: Number(total),
      metodePembayaran: metodePembayaran,
      bayar: Number(bayar),
      kembalian: Number(kembalian),
    };

    if (catatan) transaksiData.catatan = catatan;
    if (keterangan) transaksiData.keterangan = keterangan;
    if (buktiPembayaran) transaksiData.buktiPembayaran = buktiPembayaran;

    const { data: transaksi, error } = await supabase
      .from('Transaksi')
      .insert(transaksiData)
      .select()
      .single();

    if (error) throw error;

    const cartItems = await Promise.all(items.map(async (item: any) => {
      const menuId = item.menuId || item.id;
      const { data: menu } = await supabase
        .from('Menu')
        .select('harga_beli')
        .eq('id', menuId)
        .single();

      return {
        id: `CI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transaksiId: transaksi.id,
        menuId: menuId,
        nama: item.nama,
        kategori: item.kategori || "Lainnya",
        harga: Number(item.harga),
        jumlah: Number(item.jumlah),
        harga_beli: menu?.harga_beli || 0,
      };
    }));

    const { error: itemsError } = await supabase
      .from('CartItem')
      .insert(cartItems);

    if (itemsError) throw itemsError;

    for (const item of items) {
      const menuId = item.menuId || item.id;

      const { data: reseps } = await supabase
        .from('Resep')
        .select('*, BahanBaku!bahanBakuId(*)')
        .eq('menuId', menuId);

      if (reseps) {
        for (const resep of reseps) {
          const newStok = resep.BahanBaku.stok - (resep.jumlah * item.jumlah);
          const { error: updateError } = await supabase
            .from('BahanBaku')
            .update({ stok: newStok })
            .eq('id', resep.bahanBakuId);

          if (updateError) throw updateError;
        }
      }
    }

    const { data: fullTransaksi } = await supabase
      .from('Transaksi')
      .select('*, items:CartItem(*)')
      .eq('id', transaksi.id)
      .single();

    return NextResponse.json({ success: true, data: fullTransaksi });
  } catch (error: any) {
    console.error("POST /api/transaksi error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan transaksi: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
