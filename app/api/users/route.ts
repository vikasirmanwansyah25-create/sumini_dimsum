import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { cabang: true },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, nama, role, cabangId } = body;

    if (!username || !password || !nama || !role) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (role === "KASIR" && !cabangId) {
      return NextResponse.json({ error: "Cabang wajib dipilih untuk kasir" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { username, password, nama, role, cabangId },
      include: { cabang: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }
}