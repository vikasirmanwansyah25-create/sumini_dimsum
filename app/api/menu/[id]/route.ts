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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, kategori, harga, hargaBeli, tersedia, gambar, deskripsi, cabangId } = body;

    const existing = await prisma.menu.findUnique({ where: { id } });
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

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        nama,
        kategori,
        harga: Number(harga) || 0,
        hargaBeli: hargaBeli ? Number(hargaBeli) : null,
        tersedia,
        gambar: gambarPath,
        deskripsi: deskripsi || null,
        cabangId: cabangId !== undefined ? cabangId : existing.cabangId,
      },
      include: { cabang: true },
    });

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

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.menu.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Menu berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/menu/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus menu" },
      { status: 500 }
    );
  }
}