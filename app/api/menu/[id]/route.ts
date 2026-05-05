import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import fs from "fs";
import path from "path";

function saveBase64Image(base64String: string, fileName: string): string {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  
  const publicDir = path.join(process.cwd(), "public", "gambar");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const filePath = path.join(publicDir, fileName);
  fs.writeFileSync(filePath, buffer);
  
  return `/gambar/${fileName}`;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, kategori, harga, hargaBeli, tersedia, gambar, deskripsi, cabangId } = body;

    const { data: existing, error: checkError } = await supabase
      .from('Menu')
      .select('gambar')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    let gambarPath = existing.gambar;
    if (gambar && gambar.startsWith("data:image")) {
      const ext = gambar.split(";")[0].split("/")[1] || "png";
      const fileName = `menu-${Date.now()}.${ext}`;
      gambarPath = saveBase64Image(gambar, fileName);
    } else if (gambar === "" || gambar === null) {
      gambarPath = null;
    } else if (gambar) {
      gambarPath = gambar;
    }

    const updateData: any = {};
    if (nama !== undefined) updateData.nama = nama;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (harga !== undefined) updateData.harga = Number(harga) || 0;
    if (hargaBeli !== undefined) updateData.harga_beli = hargaBeli ? Number(hargaBeli) : null;
    if (tersedia !== undefined) updateData.tersedia = tersedia;
    if (gambarPath !== undefined) updateData.gambar = gambarPath;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (cabangId !== undefined) updateData.cabangId = cabangId;

    const { data: menu, error } = await supabase
      .from('Menu')
      .update(updateData)
      .eq('id', id)
      .select('*, Cabang!Menu_cabangId_fkey(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error("PUT /api/menu/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate menu" },
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
      .from('Menu')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('Menu')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Menu berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/menu/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus menu" },
      { status: 500 }
    );
  }
}
