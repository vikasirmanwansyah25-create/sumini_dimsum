import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const menuId = searchParams.get("menuId");

    let query = supabase
      .from('Resep')
      .select('*, BahanBaku!bahanBakuId(*), Menu!menuId(*)')
      .order('id', { ascending: false });

    if (menuId) {
      query = query.eq('menuId', menuId);
    }

    const { data: reseps, error } = await query;

    if (error) throw error;
    return NextResponse.json({ success: true, data: reseps });
  } catch (error) {
    console.error("GET /api/resep error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data resep" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { menuId, bahanBakuId, jumlah } = body;

    if (!menuId || !bahanBakuId || !jumlah) {
      return NextResponse.json(
        { success: false, message: "Menu, bahan baku, dan jumlah wajib diisi" },
        { status: 400 }
      );
    }

    const { data: resep, error } = await supabase
      .from('Resep')
      .insert({
        menuId: menuId,
        bahanBakuId: bahanBakuId,
        jumlah: Number(jumlah),
      })
      .select('*, BahanBaku!bahanBakuId(*), Menu!menuId(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: resep }, { status: 201 });
  } catch (error) {
    console.error("POST /api/resep error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah resep" },
      { status: 500 }
    );
  }
}
