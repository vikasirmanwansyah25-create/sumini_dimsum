import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: cabang, error } = await supabase
      .from('Cabang')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !cabang) {
      return NextResponse.json(
        { success: false, message: "Cabang tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: cabang });
  } catch (error) {
    console.error("GET /api/cabang/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data cabang" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, alamat, telepon } = body;

    const { data: existing, error: checkError } = await supabase
      .from('Cabang')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Cabang tidak ditemukan" },
        { status: 404 }
      );
    }

    const { data: cabang, error } = await supabase
      .from('Cabang')
      .update({
        nama,
        alamat: alamat || null,
        telepon: telepon || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: cabang });
  } catch (error) {
    console.error("PUT /api/cabang/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate cabang" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: existing, error: checkError } = await supabase
      .from('Cabang')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Cabang tidak ditemukan" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('Cabang')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Cabang berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/cabang/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus cabang" },
      { status: 500 }
    );
  }
}
