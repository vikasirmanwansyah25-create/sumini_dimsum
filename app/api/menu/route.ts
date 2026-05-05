import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cabangId = searchParams.get("cabangId");
    const all = searchParams.get("all");

let query = supabase
       .from('Menu')
       .select('*, cabang:Cabang!Menu_cabangId_fkey(*)');

    if (all !== "true") {
      query = query.eq('tersedia', true);
    }
    if (cabangId) {
      query = query.or(`cabangId.eq.${cabangId},cabangId.is.null`);
    }

    const { data: menu, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error("GET /api/menu error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, kategori, harga, hargaBeli, tersedia, gambar, deskripsi, cabangId } = body;

    if (!nama || !kategori || harga === undefined || harga === null || harga === '') {
      return NextResponse.json(
        { success: false, message: "Nama, kategori, dan harga wajib diisi" },
        { status: 400 }
      );
    }

    let gambarPath = null;
    if (gambar && gambar.startsWith("data:image")) {
      const ext = gambar.split(";")[0].split("/")[1] || "png";
      const fileName = `menu-${Date.now()}.${ext}`;
      gambarPath = saveBase64Image(gambar, fileName);
    } else if (gambar) {
      gambarPath = gambar;
    }

const { data: menu, error } = await supabase
       .from('Menu')
       .insert({
         id: crypto.randomUUID(),
         nama,
         kategori,
         harga: Number(harga) || 0,
         harga_beli: hargaBeli ? Number(hargaBeli) : null,
         tersedia: tersedia !== false,
         gambar: gambarPath,
         deskripsi: deskripsi || null,
         cabangId: cabangId || null,
       })
       .select('*, cabang:Cabang!Menu_cabangId_fkey(*)')
       .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: menu }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/menu error:", error);
    const message = error?.message || error?.error_description || "Gagal menambah menu";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
