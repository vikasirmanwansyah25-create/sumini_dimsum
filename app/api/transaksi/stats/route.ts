import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

function getDateRange(days: number) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit" });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cabangId = url.searchParams.get("cabangId");

    // Get user IDs for the cabang if cabangId is provided
    let userIds: string[] = [];
    if (cabangId) {
      const users = await prisma.user.findMany({
        where: { cabangId },
        select: { id: true },
      });
      userIds = users.map((u: any) => u.id);
    }

    // Build where clause for transaksi
    const whereClause: any = {};
    if (cabangId && userIds.length > 0) {
      whereClause.userId = { in: userIds };
    }

    // 7 days stats
    const { start: start7, end: end7 } = getDateRange(7);
    const transaksi7 = await prisma.transaksi.findMany({
      where: { tanggal: { gte: start7, lte: end7 }, ...whereClause },
      include: { items: true },
      orderBy: { tanggal: "asc" },
    });

    // 30 days stats
    const { start: start30, end: end30 } = getDateRange(30);
    const transaksi30 = await prisma.transaksi.findMany({
      where: { tanggal: { gte: start30, lte: end30 }, ...whereClause },
      include: { items: true },
      orderBy: { tanggal: "asc" },
    });

    // Build daily aggregation for 7 days
    const data7: Record<string, { tanggal: string; penjualan: number; laba: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(start7);
      d.setDate(d.getDate() + i);
      const key = formatDateLabel(d);
      data7[key] = { tanggal: key, penjualan: 0, laba: 0 };
    }

    for (const trx of transaksi7) {
      const key = formatDateLabel(new Date(trx.tanggal));
      if (data7[key]) {
        data7[key].penjualan += trx.total;
        // Calculate laba from menu items: (hargaJual - hargaBeli) * jumlah
        let laba = 0;
        for (const item of trx.items) {
          const menu = await prisma.menu.findUnique({ where: { id: item.menuId } });
          if (menu && menu.hargaBeli) {
            laba += (menu.harga - menu.hargaBeli) * item.jumlah;
          } else {
            // Fallback: estimate 40% profit if hargaBeli not set
            laba += (item.harga * item.jumlah) * 0.4;
          }
        }
        data7[key].laba += laba;
      }
    }

    // Build daily aggregation for 30 days
    const data30: Record<string, { tanggal: string; penjualan: number; laba: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(start30);
      d.setDate(d.getDate() + i);
      const key = formatDateLabel(d);
      data30[key] = { tanggal: key, penjualan: 0, laba: 0 };
    }

    for (const trx of transaksi30) {
      const key = formatDateLabel(new Date(trx.tanggal));
      if (data30[key]) {
        data30[key].penjualan += trx.total;
        // Calculate laba from menu items: (hargaJual - hargaBeli) * jumlah
        let laba = 0;
        for (const item of trx.items) {
          const menu = await prisma.menu.findUnique({ where: { id: item.menuId } });
          if (menu && menu.hargaBeli) {
            laba += (menu.harga - menu.hargaBeli) * item.jumlah;
          } else {
            // Fallback: estimate 40% profit if hargaBeli not set
            laba += (item.harga * item.jumlah) * 0.4;
          }
        }
        data30[key].laba += laba;
      }
    }

    // Summary stats
    const totalPenjualan = transaksi7.reduce((s: number, t: { total: number }) => s + t.total, 0);
    // Calculate actual totalLaba from transaksi7 items
    let totalLaba = 0;
    for (const trx of transaksi7) {
      for (const item of trx.items) {
        const menu = await prisma.menu.findUnique({ where: { id: item.menuId } });
        if (menu && menu.hargaBeli) {
          totalLaba += (menu.harga - menu.hargaBeli) * item.jumlah;
        } else {
          totalLaba += (item.harga * item.jumlah) * 0.4;
        }
      }
    }
    const totalTransaksi = transaksi7.length;

    return NextResponse.json({
      success: true,
      data: {
        grafik7Hari: Object.values(data7),
        grafik30Hari: Object.values(data30),
        summary: {
          totalPenjualan,
          totalLaba,
          totalTransaksi,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/transaksi/stats error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}

