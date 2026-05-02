import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, rasa, berat, stok, gambar, deskripsi, jenisProduk, satuan } = body;

    const existing = await prisma.bahanBaku.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Bahan baku tidak ditemukan" },
        { status: 404 }
      );
    }

    const bahanBaku = await prisma.bahanBaku.update({
      where: { id },
      data: {
        nama,
        rasa: rasa || null,
        berat: Number(berat) || 150,
        stok: Number(stok) || 0,
        gambar: gambar || null,
        deskripsi: deskripsi || null,
        jenisProduk: jenisProduk || "Makanan",
        satuan: satuan || "pcs",
      },
      include: { cabang: true },
    });

    return NextResponse.json({ success: true, data: bahanBaku });
  } catch (error) {
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

    const existing = await prisma.bahanBaku.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Bahan baku tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.bahanBaku.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Bahan baku berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/bahan-baku/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus bahan baku" },
      { status: 500 }
    );
  }
}