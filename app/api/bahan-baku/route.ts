import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cabangId = searchParams.get("cabangId");

    let query = supabase
      .from('BahanBaku')
      .select('*')
      .order('createdAt', { ascending: false });

    if (cabangId) {
      query = query.eq('cabangId', cabangId);
    }

    const { data: bahanBaku, error } = await query;

    if (error) throw error;

    // Ambil semua cabang untuk mapping
    const { data: cabangData } = await supabase
      .from('Cabang')
      .select('*');

    // Gabungkan data bahanBaku dengan cabang
    const bahanWithCabang = bahanBaku?.map(item => ({
      ...item,
      cabang: cabangData?.find(c => c.id === item.cabangId) || null
    }));

    return NextResponse.json({ success: true, data: bahanWithCabang });
  } catch (error: any) {
    console.error("GET /api/bahan-baku error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data bahan baku" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, rasa, berat, stok, gambar, deskripsi, cabangId, jenisProduk, satuan } = body;

    if (!nama || !cabangId) {
      return NextResponse.json(
        { success: false, message: "Nama dan cabang wajib diisi" },
        { status: 400 }
      );
    }

const { data: bahanBaku, error } = await supabase
       .from('BahanBaku')
       .insert({
         id: crypto.randomUUID(),
         nama,
         rasa: rasa || null,
         berat: Number(berat) || 150,
         stok: Number(stok) || 0,
         gambar: gambar || null,
         deskripsi: deskripsi || null,
         cabangId: cabangId,
         jenisProduk: jenisProduk || "Makanan",
         satuan: satuan || "pcs",
       })
       .select('*, cabang:Cabang!BahanBaku_cabangId_fkey(*)')
       .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: bahanBaku }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/bahan-baku error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menambah bahan baku" },
      { status: 500 }
    );
  }
}
