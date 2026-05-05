import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const cabangId = url.searchParams.get("cabangId");

    // Get date ranges
    const { start: start7, end: end7 } = getDateRange(7);
    const { start: start30, end: end30 } = getDateRange(30);

    // Build queries
    let query7 = supabase
      .from('Transaksi')
      .select('id, total, tanggal')
      .gte('tanggal', start7.toISOString())
      .lte('tanggal', end7.toISOString())
      .order('tanggal', { ascending: true });

    let query30 = supabase
      .from('Transaksi')
      .select('id, total, tanggal')
      .gte('tanggal', start30.toISOString())
      .lte('tanggal', end30.toISOString())
      .order('tanggal', { ascending: true });

    // Filter by cabang if specified
    if (cabangId) {
      const { data: users } = await supabase
        .from('User')
        .select('id')
        .eq('cabangId', cabangId);

      if (users && users.length > 0) {
        const userIds = users.map((u: any) => u.id);
        query7 = query7.in('userId', userIds);
        query30 = query30.in('userId', userIds);
      }
    }

    // Execute queries
    const { data: transaksi7, error: error7 } = await query7;
    if (error7) throw error7;

    const { data: transaksi30, error: error30 } = await query30;
    if (error30) throw error30;

    // Build 7-day chart data
    const data7: Record<string, { tanggal: string; penjualan: number; laba: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(start7);
      d.setDate(d.getDate() + i);
      const key = formatDateLabel(d);
      data7[key] = { tanggal: key, penjualan: 0, laba: 0 };
    }

    if (transaksi7) {
      for (const trx of transaksi7) {
        const key = formatDateLabel(new Date(trx.tanggal));
        if (data7[key]) {
          data7[key].penjualan += trx.total || 0;
          data7[key].laba += (trx.total || 0) * 0.3;
        }
      }
    }

    // Build 30-day chart data
    const data30: Record<string, { tanggal: string; penjualan: number; laba: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(start30);
      d.setDate(d.getDate() + i);
      const key = formatDateLabel(d);
      data30[key] = { tanggal: key, penjualan: 0, laba: 0 };
    }

    if (transaksi30) {
      for (const trx of transaksi30) {
        const key = formatDateLabel(new Date(trx.tanggal));
        if (data30[key]) {
          data30[key].penjualan += trx.total || 0;
          data30[key].laba += (trx.total || 0) * 0.3;
        }
      }
    }

    // Calculate summary
    const totalPenjualan = transaksi7 ? transaksi7.reduce((s: number, t: any) => s + (t.total || 0), 0) : 0;
    const totalLaba = totalPenjualan * 0.3;
    const totalTransaksi = transaksi7 ? transaksi7.length : 0;

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
  } catch (error: any) {
    console.error("GET /api/transaksi/stats error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil statistik: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
