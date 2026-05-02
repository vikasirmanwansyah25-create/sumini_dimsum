import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, alamat, telepon } = body;

    const existing = await prisma.cabang.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Cabang tidak ditemukan" },
        { status: 404 }
      );
    }

    const cabang = await prisma.cabang.update({
      where: { id },
      data: {
        nama,
        alamat: alamat || null,
        telepon: telepon || null,
      },
    });

    return NextResponse.json({ success: true, data: cabang });
  } catch (error) {
    console.error("PUT /api/cabang/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate cabang" },
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

    const existing = await prisma.cabang.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Cabang tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.cabang.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Cabang berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/cabang/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus cabang" },
      { status: 500 }
    );
  }
}
