import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ 
      where: { id },
      include: { cabang: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil user" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (body.role === "KASIR" && !body.cabangId) {
      return NextResponse.json({ error: "Cabang wajib dipilih untuk kasir" }, { status: 400 });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: body,
      include: { cabang: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengupdate user" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}