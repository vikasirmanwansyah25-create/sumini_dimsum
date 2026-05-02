import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cabang = await prisma.cabang.findMany({
      orderBy: { createdAt: "desc" },
      include: { bahanBaku: true },
    });
    return NextResponse.json({ success: true, data: cabang });
  } catch (error) {
    console.error("GET /api/cabang error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data cabang" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, alamat, telepon } = body;

    if (!nama) {
      return NextResponse.json(
        { success: false, message: "Nama cabang wajib diisi" },
        { status: 400 }
      );
    }

    const cabang = await prisma.cabang.create({
      data: {
        nama,
        alamat: alamat || null,
        telepon: telepon || null,
      },
    });

    return NextResponse.json({ success: true, data: cabang }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cabang error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah cabang" },
      { status: 500 }
    );
  }
}
