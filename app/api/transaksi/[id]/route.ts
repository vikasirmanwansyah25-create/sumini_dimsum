import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { buktiPenjualan } = body;
    const { id } = await params;

    const { data: transaksi, error } = await supabase
      .from('Transaksi')
      .update({ buktiPenjualan: buktiPenjualan })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: transaksi });
  } catch (error) {
    console.error("PATCH /api/transaksi/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate transaksi" },
      { status: 500 }
    );
  }
}
