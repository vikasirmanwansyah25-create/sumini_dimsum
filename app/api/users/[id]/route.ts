import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Unexpected error:", error);
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
    
    console.log("Updating user:", id, body);

    if (body.role === "KASIR" && !body.cabangId) {
      return NextResponse.json({ success: false, message: "Cabang wajib dipilih untuk kasir" }, { status: 400 });
    }
    
    const updateData: any = {};
    if (body.username !== undefined) updateData.username = body.username;
    if (body.nama !== undefined) updateData.nama = body.nama;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.cabangId !== undefined) updateData.cabangId = body.cabangId || null;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.password !== undefined && body.password !== "") updateData.password = body.password;

    const { data: user, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', id)
      .select(`*, cabang:Cabang(id, nama, alamat)`)
      .maybeSingle();

    if (error) {
      console.error("Supabase UPDATE error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    console.log("User updated successfully:", user);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengupdate user" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Deleting user:", id);

    const { error } = await supabase
      .from('User')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Supabase DELETE error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    console.log("User deleted successfully");
    return NextResponse.json({ success: true, message: "User berhasil dihapus" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus user" }, { status: 500 });
  }
}
