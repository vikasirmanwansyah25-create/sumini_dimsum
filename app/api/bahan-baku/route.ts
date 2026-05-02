import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cabangId = searchParams.get("cabangId");

    const where: any = {};
    if (cabangId) {
      where.cabangId = cabangId;
    }

    const bahanBaku = await prisma.bahanBaku.findMany({
      where,
      include: { cabang: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: bahanBaku });
  } catch (error) {
    console.error("GET /api/bahan-baku error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data bahan baku" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, rasa, berat, stok, gambar, deskripsi, cabangId, jenisProduk, satuan } = body;

    if (!nama || !cabangId) {
      return NextResponse.json(
        { success: false, message: "Nama dan cabang wajib diisi" },
        { status: 400 }
      );
    }

    const bahanBaku = await prisma.bahanBaku.create({
      data: {
        nama,
        rasa: rasa || null,
        berat: Number(berat) || 150,
        stok: Number(stok) || 0,
        gambar: gambar || null,
        deskripsi: deskripsi || null,
        cabangId,
        jenisProduk: jenisProduk || "Makanan",
        satuan: satuan || "pcs",
      },
      include: { cabang: true },
    });

    return NextResponse.json({ success: true, data: bahanBaku }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bahan-baku error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah bahan baku" },
      { status: 500 }
    );
  }
}