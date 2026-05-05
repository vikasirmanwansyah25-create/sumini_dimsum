import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { deleteImageFromCloudinary } from "@/lib/cloudinary-server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, rasa, berat, stok, gambar, deskripsi, jenisProduk, satuan } = body;

    const { data: existing, error: checkError } = await supabase
      .from('BahanBaku')
      .select('id, gambar')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Bahan baku tidak ditemukan" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (nama !== undefined) updateData.nama = nama;
    if (rasa !== undefined) updateData.rasa = rasa;
    if (berat !== undefined) updateData.berat = Number(berat) || 150;
    if (stok !== undefined) updateData.stok = Number(stok) || 0;
    if (gambar !== undefined) updateData.gambar = gambar;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (jenisProduk !== undefined) updateData.jenisProduk = jenisProduk;
    if (satuan !== undefined) updateData.satuan = satuan;

    if (gambar !== undefined && existing.gambar && existing.gambar !== gambar) {
      await deleteImageFromCloudinary(existing.gambar);
    }

    const { data: bahanBaku, error } = await supabase
      .from('BahanBaku')
      .update(updateData)
      .eq('id', id)
      .select('*, Cabang!BahanBaku_cabangId_fkey(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: bahanBaku });
  } catch (error: any) {
    console.error("PUT /api/bahan-baku/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate bahan baku" },
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
      .from('BahanBaku')
      .select('id, gambar')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Bahan baku tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existing.gambar) {
      await deleteImageFromCloudinary(existing.gambar);
    }

    const { error } = await supabase
      .from('BahanBaku')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Bahan baku berhasil dihapus" });
  } catch (error: any) {
    console.error("DELETE /api/bahan-baku/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus bahan baku" },
      { status: 500 }
    );
  }
}
