"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User, Lock, ChevronRight, Eye, EyeOff, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { login, fetchUsers } = useAuthStore();

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await fetchUsers();
    await new Promise((resolve) => setTimeout(resolve, 800));
    const user = login(username, password);

    if (user) {
      router.push(user.role === "ADMIN" ? "/admin" : "/cashier");
    } else {
      setError("Username atau password salah.");
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f1f5f9] p-4 font-sans overflow-hidden">
      <div className="grid w-full max-w-5xl h-[580px] grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-[2.5rem] bg-white shadow-lg">

        {/* SISI KIRI: Gambar Produk (Full) */}
        <div className="hidden lg:block relative w-full h-full bg-slate-50">
          {/* Pastikan file sumini.png ada di folder: public/gambar/sumini.png */}
          <img
            src="/gambar/sumini.png"
            alt="Produk Visual Sumini"
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
            onError={(e) => {
              // Fallback jika gambar tidak ditemukan
              e.currentTarget.src = "https://via.placeholder.com/800x600?text=Gambar+Tidak+Ditemukan";
            }}
          />
          {/* Overlay dihapus agar gambar tidak gelap */}
        </div>

        {/* SISI KANAN: Form Login */}
        <div className="flex flex-col justify-center px-8 md:px-12 py-6 bg-[#F5FFFA]">
          <div className="mx-auto w-full max-w-[340px]">
            <div className="mb-6 text-left">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Selamat Datang!
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                Masuk untuk mengelola sistem kasir sumini.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 w-full rounded-xl border-2 border-slate-100 bg-slate-50/50 pl-11 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border-2 border-slate-100 bg-slate-50/50 pl-11 pr-11 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-[10px] font-semibold px-1">* {error}</p>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full rounded-xl bg-[#4B736A] text-sm font-bold text-white hover:bg-[#3d5f58] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isLoading ? "Memproses..." : "Masuk Sekarang"}
                  {!isLoading && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}