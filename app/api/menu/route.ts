import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cabangId = searchParams.get("cabangId");
    const all = searchParams.get("all");

    const where: any = {};
    if (all !== "true") {
      where.tersedia = true;
    }
    if (cabangId) {
      where.OR = [
        { cabangId: cabangId },
        { cabangId: null }
      ];
    }

    const menu = await prisma.menu.findMany({
      where,
      include: { cabang: true },
      orderBy: { createdAt: "desc" },
    });
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

    if (!nama || !kategori || !harga) {
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

    const menu = await prisma.menu.create({
      data: {
        nama,
        kategori,
        harga: Number(harga) || 0,
        hargaBeli: hargaBeli ? Number(hargaBeli) : null,
        tersedia: tersedia !== false,
        gambar: gambarPath,
        deskripsi: deskripsi || null,
        cabangId: cabangId || null,
      },
      include: { cabang: true },
    });

    return NextResponse.json({ success: true, data: menu }, { status: 201 });
  } catch (error) {
    console.error("POST /api/menu error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah menu" },
      { status: 500 }
    );
  }
}