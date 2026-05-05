import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('User')
      .select('*, Cabang(id, nama, alamat)')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(users || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, nama, role, cabangId } = body;

    console.log("Creating user with data:", { username, nama, role, cabangId });

    if (!username || !password || !nama || !role) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (role === "KASIR" && !cabangId) {
      return NextResponse.json({ error: "Cabang wajib dipilih untuk kasir" }, { status: 400 });
    }

    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (checkError) {
      console.error("Check username error:", checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
    }

    const userData = {
      id: randomUUID(),
      username,
      password,
      nama,
      role,
      cabangId: cabangId || null
    };

    const { data: user, error } = await supabase
      .from('User')
      .insert(userData)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase INSERT error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("User created successfully:", user);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }
}
