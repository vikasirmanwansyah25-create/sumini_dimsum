"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Search, ImageIcon, Package, Loader2, MapPin } from "lucide-react";
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

interface BahanBaku {
  id: string;
  nama: string;
  rasa?: string;
  berat: number;
  stok: number;
  satuan: string;
  gambar?: string;
  deskripsi?: string;
  jenisProduk: string;
  cabangId: string;
  cabang?: Cabang;
  createdAt: string;
}

export default function InventoryPage() {
  const [bahanBaku, setBahanBaku] = React.useState<BahanBaku[]>([]);
  const [cabang, setCabang] = React.useState<Cabang[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [bahanRes, cabangRes] = await Promise.all([
          fetch("/api/bahan-baku"),
          fetch("/api/cabang"),
        ]);
        const bahanJson = await bahanRes.json();
        const cabangJson = await cabangRes.json();
        if (bahanJson.success) setBahanBaku(bahanJson.data);
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
  const [filterCabang, setFilterCabang] = React.useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedBahan, setSelectedBahan] = React.useState<BahanBaku | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [formData, setFormData] = React.useState({
    nama: "",
    rasa: "",
    berat: 150,
    stok: 0,
    gambar: "",
    deskripsi: "",
    jenisProduk: "Makanan",
    cabangId: "",
    satuan: "pcs",
  });
  const [imagePreview, setImagePreview] = React.useState<string>("");

  const handleOpenDialog = (p?: BahanBaku) => {
    if (p) {
      setSelectedBahan(p);
      setFormData({
        nama: p.nama,
        rasa: p.rasa || "",
        berat: p.berat,
        stok: p.stok,
        gambar: p.gambar || "",
        deskripsi: p.deskripsi || "",
        jenisProduk: p.jenisProduk || "Makanan",
        cabangId: p.cabangId,
        satuan: (p as any).satuan || "pcs",
      });
      setImagePreview(p.gambar || "");
    } else {
      setSelectedBahan(null);
      setFormData({
        nama: "",
        rasa: "",
        berat: 150,
        stok: 0,
        gambar: "",
        deskripsi: "",
        jenisProduk: "Makanan",
        cabangId: filterCabang || "",
        satuan: "pcs",
      });
      setImagePreview("");
    }
    setIsDialogOpen(true);
  };

  const handleJenisChange = (jenis: string) => {
    setFormData({ ...formData, jenisProduk: jenis, rasa: jenis === "Barang" ? "" : formData.rasa });
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

  const filteredBahan = bahanBaku.filter((p) => {
    const matchesSearch =
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.rasa && p.rasa.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCabang = filterCabang === "all" || p.cabangId === filterCabang;
    return matchesSearch && matchesCabang;
  });

  const handleSave = async () => {
    if (!formData.nama || !formData.cabangId) {
      alert("Mohon lengkapi field utama (nama dan cabang)");
      return;
    }

    // Validasi rasa wajib untuk Makanan dan Minuman
    if ((formData.jenisProduk === "Makanan" || formData.jenisProduk === "Minuman") && !formData.rasa) {
      alert("Mohon lengkapi field rasa untuk jenis " + formData.jenisProduk);
      return;
    }

    setSaving(true);
    try {
      if (selectedBahan) {
        const res = await fetch(`/api/bahan-baku/${selectedBahan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setBahanBaku(bahanBaku.map((p) => (p.id === selectedBahan.id ? json.data : p)));
          setIsDialogOpen(false);
        } else {
          alert(json.message || "Gagal mengupdate bahan");
        }
      } else {
        const res = await fetch("/api/bahan-baku", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setBahanBaku([json.data, ...bahanBaku]);
          setIsDialogOpen(false);
        } else {
          alert(json.message || "Gagal menambah bahan");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBahan) return;
    try {
      const res = await fetch(`/api/bahan-baku/${selectedBahan.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setBahanBaku(bahanBaku.filter((p) => p.id !== selectedBahan.id));
        setIsDeleteDialogOpen(false);
        setSelectedBahan(null);
      } else {
          alert(json.message || "Gagal menghapus bahan");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-0.5">Kelola bahan baku dimsum</p>
        </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-[#4A776E] hover:bg-[#4A776E]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bahan
          </Button>
      </div>

      <Card className="border border-slate-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm lg:text-base font-semibold text-slate-900">Daftar Bahan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari produk atau rasa..."
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

          {/* Table - Horizontal scroll on mobile */}
          <div className="overflow-auto border border-slate-100 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[80px] text-xs font-semibold text-slate-600">Gambar</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Nama Bahan</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Rasa</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Cabang</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Stok</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Berat</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-[#4A776E]" />
                        <p className="text-sm text-slate-500">Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredBahan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-slate-300" />
                        <p className="text-sm text-slate-500">Tidak ada bahan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBahan.map((p) => (
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
                          {p.rasa}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-medium text-slate-900">{p.cabang?.nama || "-"}</p>
                          {p.cabang?.alamat && (
                            <p className="text-[11px] text-slate-500 leading-relaxed">{p.cabang.alamat}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`font-medium text-[10px] ${p.stok < 20
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            }`}
                          variant="outline"
                        >
                          {p.stok} {(p as any).satuan || 'pcs'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{p.berat}g</TableCell>
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
                              setSelectedBahan(p);
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
              {selectedBahan ? "Edit Bahan" : "Tambah Bahan Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 lg:gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nama Bahan</label>
                <Input
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Kulit Dimsum Premium"
                  className="h-10 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Jenis Bahan</label>
                <Select
                  value={formData.jenisProduk}
                  onValueChange={handleJenisChange}
                >
                  <SelectTrigger className="h-10 border-slate-200">
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Makanan">Makanan</SelectItem>
                    <SelectItem value="Minuman">Minuman</SelectItem>
                    <SelectItem value="Barang">Barang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Rasa</label>
                <Input
                  value={formData.rasa}
                  onChange={(e) => setFormData({ ...formData, rasa: e.target.value })}
                  placeholder="Contoh: Original"
                  className="h-10 border-slate-200"
                  disabled={formData.jenisProduk === "Barang"}
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
              <label className="text-sm font-medium text-slate-700">Cabang</label>
              <Select
                value={formData.cabangId}
                onValueChange={(val) => setFormData({ ...formData, cabangId: val })}
              >
                <SelectTrigger className="h-10 border-slate-200">
                  <SelectValue placeholder="Pilih Cabang" />
                </SelectTrigger>
                <SelectContent>
                  {cabang.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Berat (g)</label>
                <Input
                  type="number"
                  value={formData.berat}
                  onChange={(e) =>
                    setFormData({ ...formData, berat: parseInt(e.target.value) || 0 })
                  }
                  className="h-10 border-slate-200"
                />
              </div>
              <div className="space-y-1.5 col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-slate-700">Stok</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.stok}
                    onChange={(e) =>
                      setFormData({ ...formData, stok: parseInt(e.target.value) || 0 })
                    }
                    className="h-10 border-slate-200"
                  />
                  <Select
                    value={formData.satuan}
                    onValueChange={(val) => setFormData({ ...formData, satuan: val })}
                  >
                    <SelectTrigger className="h-10 border-slate-200 w-[120px]">
                      <SelectValue placeholder="Satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pcs</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Deskripsi</label>
              <Input
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Contoh: Bahan baku untuk membuat dimsum..."
                className="h-10 border-slate-200"
              />
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
          <div className="py-3 lg:4">
            <p className="text-slate-600 text-sm">
              Apakah Anda yakin ingin menghapus bahan baku{" "}
              <span className="font-semibold text-slate-900">{selectedBahan?.nama}</span>?
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

