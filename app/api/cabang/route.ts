import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const { data: cabang, error } = await supabase
      .from('Cabang')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error("Supabase GET cabang error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: cabang || [] });
  } catch (error) {
    console.error("GET /api/cabang error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data cabang" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, alamat, telepon } = body;

    if (!nama) {
      return NextResponse.json(
        { success: false, message: "Nama cabang wajib diisi" },
        { status: 400 }
      );
    }

    const cabangData = {
      id: randomUUID(),
      nama,
      alamat: alamat || null,
      telepon: telepon || null,
    };

    const { data: cabang, error } = await supabase
      .from('Cabang')
      .insert(cabangData)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase POST cabang error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: cabang }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cabang error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah cabang" },
      { status: 500 }
    );
  }
}
