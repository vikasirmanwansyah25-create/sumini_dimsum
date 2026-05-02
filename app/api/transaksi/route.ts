import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cabangId = url.searchParams.get("cabangId");

    // Build where clause
    const whereClause: any = {};
    if (cabangId) {
      whereClause.user = { cabangId };
    }

    const transaksi = await prisma.transaksi.findMany({
      where: whereClause,
      include: { 
        items: true,
        user: {
          select: {
            nama: true,
            cabang: {
              select: {
                id: true,
                nama: true,
              }
            }
          }
        }
      },
      orderBy: { tanggal: "desc" },
    });
    return NextResponse.json({ success: true, data: transaksi });
  } catch (error) {
    console.error("GET /api/transaksi error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data transaksi" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      items,
      subtotal,
      total,
      metodePembayaran,
      bayar,
      kembalian,
      catatan,
      keterangan,
      buktiPembayaran,
    } = body;

    console.log("Received payload:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "items is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    // Build data object, only include defined optional fields
    const transaksiData: any = {
      userId,
      subtotal: Number(subtotal),
      pajak: 0,
      total: Number(total),
      metodePembayaran,
      bayar: Number(bayar),
      kembalian: Number(kembalian),
      items: {
        create: items.map((item: any) => ({
          menuId: item.menuId || item.id,
          nama: item.nama,
          kategori: item.kategori || "Lainnya",
          harga: Number(item.harga),
          jumlah: Number(item.jumlah),
        })),
      },
    };

    // Only add optional fields if they have values
    if (catatan !== undefined && catatan !== null && catatan !== "") {
      transaksiData.catatan = catatan;
    }
    if (keterangan !== undefined && keterangan !== null && keterangan !== "") {
      transaksiData.keterangan = keterangan;
    }
    if (buktiPembayaran !== undefined && buktiPembayaran !== null && buktiPembayaran !== "") {
      transaksiData.buktiPembayaran = buktiPembayaran;
    }

    console.log("Creating transaction with data:", JSON.stringify(transaksiData, null, 2));

    const transaksi = await prisma.transaksi.create({
      data: transaksiData,
      include: { items: true },
    });

    for (const item of items) {
      const mid = item.menuId || item.id;

      // Kurangi stok bahan baku berdasarkan resep
      const reseps = await prisma.resep.findMany({
        where: { menuId: mid },
        include: { bahanBaku: true },
      });

      for (const resep of reseps) {
        await prisma.bahanBaku.update({
          where: { id: resep.bahanBakuId },
          data: { stok: { decrement: resep.jumlah * item.jumlah } },
        });
      }
    }

    return NextResponse.json({ success: true, data: transaksi });
  } catch (error: any) {
    console.error("POST /api/transaksi error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan transaksi: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}

