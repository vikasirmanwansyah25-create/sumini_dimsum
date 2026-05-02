import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const menuId = searchParams.get("menuId");
    
    const where: any = {};
    if (menuId) where.menuId = menuId;
    
    const reseps = await prisma.resep.findMany({
      where,
      include: { bahanBaku: true, menu: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ success: true, data: reseps });
  } catch (error) {
    console.error("GET /api/resep error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data resep" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { menuId, bahanBakuId, jumlah } = body;

    if (!menuId || !bahanBakuId || !jumlah) {
      return NextResponse.json(
        { success: false, message: "Menu, bahan baku, dan jumlah wajib diisi" },
        { status: 400 }
      );
    }

    const resep = await prisma.resep.create({
      data: {
        menuId,
        bahanBakuId,
        jumlah: Number(jumlah),
      },
      include: { bahanBaku: true, menu: true },
    });

    return NextResponse.json({ success: true, data: resep }, { status: 201 });
  } catch (error) {
    console.error("POST /api/resep error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah resep" },
      { status: 500 }
    );
  }
}
