import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { buktiPenjualan } = body;
    const { id } = await params;

    const transaksi = await prisma.transaksi.update({
      where: { id },
      data: { buktiPenjualan },
    });

    return NextResponse.json({ success: true, data: transaksi });
  } catch (error) {
    console.error("PATCH /api/transaksi/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate transaksi" },
      { status: 500 }
    );
  }
}
