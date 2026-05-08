"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, X, ImageIcon } from "lucide-react";

const kategoriOptions = ["Makanan", "Minuman", "Snack", "Paket", "Dimsum", "Side Dish", "Spesial"];

interface AddMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  menu?: any | null;
}

export function AddMenuDialog({ open, onOpenChange, onSuccess, menu }: AddMenuDialogProps) {
  const isEdit = !!menu;
  const [nama, setNama] = React.useState("");
  const [kategori, setKategori] = React.useState("");
  const [hargaJual, setHargaJual] = React.useState("");
  const [hargaBeli, setHargaBeli] = React.useState("");
  const [deskripsi, setDeskripsi] = React.useState("");
  const [gambar, setGambar] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (menu) {
      setNama(menu.nama || "");
      setKategori(menu.kategori || "");
      setHargaJual(menu.harga?.toString() || "");
      setHargaBeli(menu.hargaBeli?.toString() || "");
      setDeskripsi(menu.deskripsi || "");
      setGambar(menu.gambar || null);
    } else {
      setNama("");
      setKategori("");
      setHargaJual("");
      setHargaBeli("");
      setDeskripsi("");
      setGambar(null);
    }
  }, [menu, open]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap upload file gambar (JPG, PNG, dll)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setGambar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeGambar = () => {
    setGambar(null);
  };

  const handleSubmit = async () => {
    if (!nama || !kategori || !hargaJual) {
      alert("Nama, kategori, dan harga jual wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nama,
        kategori,
        harga: Number(hargaJual),
        hargaBeli: hargaBeli ? Number(hargaBeli) : null,
        tersedia: true,
        gambar,
        deskripsi: deskripsi || null,
      };

      const url = isEdit ? `/api/menu/${menu.id}` : "/api/menu";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        alert("Gagal menambah menu: " + json.message);
        setLoading(false);
        return;
      }

      // Reset form
      setNama("");
      setKategori("");
      setHargaJual("");
      setHargaBeli("");
      setDeskripsi("");
      setGambar(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Add menu error:", err);
      alert("Terjadi kesalahan saat menambah menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nama */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Nama Menu <span className="text-red-500">*</span></p>
            <Input
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Dimsum Ayam"
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Kategori <span className="text-red-500">*</span></p>
            <Select value={kategori} onValueChange={setKategori}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategoriOptions.map((kat) => (
                  <SelectItem key={kat} value={kat}>
                    {kat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Harga Jual & Harga Beli */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Harga Jual <span className="text-red-500">*</span></p>
              <Input
                id="hargaJual"
                type="number"
                min={0}
                value={hargaJual}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) setHargaJual(val);
                }}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Harga Beli</p>
              <Input
                id="hargaBeli"
                type="number"
                min={0}
                value={hargaBeli}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) setHargaBeli(val);
                }}
                placeholder="0"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Deskripsi</p>
            <Textarea
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi menu..."
              className="resize-none"
            />
          </div>

          {/* Upload Gambar */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Gambar Menu</p>
            {gambar ? (
              <div className="relative rounded-lg border overflow-hidden">
                <img src={gambar} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  onClick={removeGambar}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#26B0AC] cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">
                  <span className="font-medium text-[#4A776E]">Klik untuk upload</span>
                </p>
                <p className="text-xs text-slate-400">PNG, JPG (max 5MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#4A776E] hover:bg-[#4A776E]/90 text-white"
          >
            {loading ? "Menyimpan..." : (isEdit ? "Update Menu" : "Simpan Menu")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
