"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Search, ImageIcon, ShoppingBag, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRupiah } from "@/lib/utils";

interface Cabang {
  id: string;
  nama: string;
  alamat?: string;
  telepon?: string;
}

interface Produk {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  hargaBeli?: number | null;
  gambar?: string;
  deskripsi?: string;
  tersedia: boolean;
  cabangId?: string;
  cabang?: Cabang;
  createdAt: string;
}

export default function ProdukPage() {
  const [produk, setProduk] = React.useState<Produk[]>([]);
  const [cabang, setCabang] = React.useState<Cabang[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterCabang, setFilterCabang] = React.useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedProduk, setSelectedProduk] = React.useState<Produk | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [formData, setFormData] = React.useState({
    nama: "",
    kategori: "Makanan",
    harga: 0,
    hargaBeli: 0,
    tersedia: true,
    gambar: "",
    deskripsi: "",
    cabangId: null as string | null,
  });
  const [imagePreview, setImagePreview] = React.useState<string>("");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [produkRes, cabangRes] = await Promise.all([
          fetch("/api/menu?all=true"),
          fetch("/api/cabang"),
        ]);
        const produkJson = await produkRes.json();
        const cabangJson = await cabangRes.json();
        if (produkJson.success) setProduk(produkJson.data);
        if (cabangJson.success) setCabang(cabangJson.data);
      } catch (error) {
        console.error("Fetch error:", error);
        alert("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenDialog = (p?: Produk) => {
    if (p) {
      setSelectedProduk(p);
      setFormData({
        nama: p.nama,
        kategori: p.kategori || "Makanan",
        harga: p.harga,
        hargaBeli: p.hargaBeli || 0,
        tersedia: p.tersedia,
        gambar: p.gambar || "",
        deskripsi: p.deskripsi || "",
        cabangId: p.cabangId || null,
      });
      setImagePreview(p.gambar || "");
    } else {
      setSelectedProduk(null);
      setFormData({
        nama: "",
        kategori: "Makanan",
        harga: 0,
        hargaBeli: 0,
        tersedia: true,
        gambar: "",
        deskripsi: "",
        cabangId: filterCabang === "all" ? null : filterCabang,
      });
      setImagePreview("");
    }
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const base64 = reader.result as string;
      setImagePreview(base64);
      setFormData({ ...formData, gambar: base64 });
    };
    reader.readAsDataURL(file);
  };

  const filteredProduk = produk.filter((p) => {
    const matchesSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kategori.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCabang = filterCabang === "all" ||
      p.cabangId === filterCabang;
    return matchesSearch && matchesCabang;
  });

  const handleSave = async () => {
    if (!formData.nama || !formData.kategori || !formData.harga) {
      alert("Nama, kategori, dan harga wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const url = selectedProduk
        ? `/api/menu/${selectedProduk.id}`
        : "/api/menu";
      const method = selectedProduk ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        if (selectedProduk) {
          setProduk(produk.map((p) => (p.id === selectedProduk.id ? json.data : p)));
        } else {
          setProduk([json.data, ...produk]);
        }
        setIsDialogOpen(false);
      } else {
        alert(json.message || "Gagal menyimpan produk");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduk) return;
    try {
      const res = await fetch(`/api/menu/${selectedProduk.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setProduk(produk.filter((p) => p.id !== selectedProduk.id));
        setIsDeleteDialogOpen(false);
        setSelectedProduk(null);
      } else {
        alert(json.message || "Gagal menghapus produk");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Kelola Produk</h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-0.5">Kelola menu yang dijual di berbagai cabang</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#4A776E] hover:bg-[#4A776E]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      <Card className="border border-slate-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm lg:text-base font-semibold text-slate-900">Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-white border-slate-200"
              />
            </div>
            <div className="w-full sm:w-[280px]">
              <Select value={filterCabang} onValueChange={setFilterCabang}>
                <SelectTrigger className="h-10 bg-white border-slate-200 w-full">
                  <SelectValue placeholder="Pilih Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  {cabang.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-auto border border-slate-100 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[80px] text-xs font-semibold text-slate-600">Gambar</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Nama Produk</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Kategori</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Cabang</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Harga</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-[#26B0AC]" />
                        <p className="text-sm text-slate-500">Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProduk.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingBag className="h-8 w-8 text-slate-300" />
                        <p className="text-sm text-slate-500">Tidak ada produk</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProduk.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        {p.gambar ? (
                          <img
                            src={p.gambar}
                            alt={p.nama}
                            className="h-10 w-10 rounded-lg object-cover border border-slate-100"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-sm text-slate-900">{p.nama}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium text-[10px]">
                          {p.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {p.cabang?.nama || "Semua Cabang"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {formatRupiah(p.harga)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`font-medium text-[10px] ${
                            p.tersedia
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-slate-50 text-slate-600 border-slate-100"
                          }`}
                          variant="outline"
                        >
                          {p.tersedia ? "Tersedia" : "Tidak Tersedia"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-[#4A776E] hover:bg-[#4A776E]/10"
                            onClick={() => handleOpenDialog(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => {
                              setSelectedProduk(p);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg sm:max-w-2xl border-slate-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {selectedProduk ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 lg:gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nama Produk</label>
                <Input
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Dimsum Ayam"
                  className="h-10 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Kategori</label>
                <Select
                  value={formData.kategori}
                  onValueChange={(val) => setFormData({ ...formData, kategori: val })}
                >
                  <SelectTrigger className="h-10 border-slate-200">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Makanan">Makanan</SelectItem>
                    <SelectItem value="Minuman">Minuman</SelectItem>
                    <SelectItem value="Snack">Snack</SelectItem>
                    <SelectItem value="Paket">Paket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Cabang</label>
              <Select
                value={formData.cabangId || "all"}
                onValueChange={(val) => setFormData({ ...formData, cabangId: val === "all" ? null : val })}
              >
                <SelectTrigger className="h-10 border-slate-200">
                  <SelectValue placeholder="Pilih Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  {cabang.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Harga Jual</label>
                <Input
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: parseInt(e.target.value) || 0 })}
                  className="h-10 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Harga Beli</label>
                <Input
                  type="number"
                  value={formData.hargaBeli}
                  onChange={(e) => setFormData({ ...formData, hargaBeli: parseInt(e.target.value) || 0 })}
                  className="h-10 border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Gambar</label>
              <div className="flex items-center gap-3 lg:gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-3 lg:px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-sm text-slate-600">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    id="upload-file"
                  />
                  <ImageIcon className="h-4 w-4" />
                  <span>Upload Gambar</span>
                </label>
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-12 lg:h-14 w-12 lg:w-14 rounded-lg object-cover border border-slate-100"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Deskripsi</label>
              <Input
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Deskripsi produk..."
                className="h-10 border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tersedia"
                checked={formData.tersedia}
                onChange={(e) => setFormData({ ...formData, tersedia: e.target.checked })}
                className="rounded border-slate-300"
              />
              <label htmlFor="tersedia" className="text-sm text-slate-700">
                Tersedia untuk dijual
              </label>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-200">
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#4A776E] hover:bg-[#4A776E]/90 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Konfirmasi Hapus
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 lg:py-4">
            <p className="text-slate-600 text-sm">
              Apakah Anda yakin ingin menghapus produk{" "}
              <span className="font-semibold text-slate-900">{selectedProduk?.nama}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-slate-200"
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
