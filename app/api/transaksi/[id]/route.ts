import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: existing, error: checkError } = await supabase
      .from('Transaksi')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    const { error: itemsError } = await supabase
      .from('CartItem')
      .delete()
      .eq('transaksiId', id);

    if (itemsError) throw itemsError;

    const { error } = await supabase
      .from('Transaksi')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Transaksi berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/transaksi/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus transaksi" },
      { status: 500 }
    );
  }
}
