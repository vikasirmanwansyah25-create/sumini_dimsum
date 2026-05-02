"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Search, ImageIcon, Package, Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth";

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

export default function CashierInventoryPage() {
  const [bahanBaku, setBahanBaku] = React.useState<BahanBaku[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { currentUser } = useAuthStore();

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
    satuan: "pcs",
  });
  const [imagePreview, setImagePreview] = React.useState<string>("");

  const fetchData = async () => {
    try {
      const url = currentUser?.cabangId
        ? `/api/bahan-baku?cabangId=${currentUser.cabangId}`
        : "/api/bahan-baku";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setBahanBaku(json.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [currentUser?.cabangId]);

  const filteredBahan = bahanBaku.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.nama.toLowerCase().includes(search) ||
      (item.rasa && item.rasa.toLowerCase().includes(search))
    );
  });

  const totalStok = filteredBahan.reduce((acc, item) => acc + item.stok, 0);
  const makananCount = filteredBahan.filter(item => item.jenisProduk === "Makanan").length;
  const minumanCount = filteredBahan.filter(item => item.jenisProduk === "Minuman").length;
  const barangCount = filteredBahan.filter(item => item.jenisProduk === "Barang").length;

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

  const handleSave = async () => {
    if (!formData.nama) {
      alert("Nama produk wajib diisi");
      return;
    }

    if (formData.jenisProduk === "Makanan" && !formData.rasa) {
      alert("Rasa wajib diisi untuk jenis Makanan");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        cabangId: currentUser?.cabangId,
      };

      if (selectedBahan) {
        const res = await fetch(`/api/bahan-baku/${selectedBahan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
          body: JSON.stringify(payload),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 lg:gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Inventory Cabang</h1>
          <p className="text-sm lg:text-base text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {currentUser?.cabang?.nama || "Semua Cabang"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg">
            <Package className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">
              Total Stok: {totalStok} item
            </span>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-[#4A776E] hover:bg-[#4A776E]/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bahan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Bahan</p>
                <p className="text-lg font-bold text-slate-800">{filteredBahan.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Makanan</p>
                <p className="text-lg font-bold text-slate-800">{makananCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Minuman</p>
                <p className="text-lg font-bold text-slate-800">{minumanCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Barang</p>
                <p className="text-lg font-bold text-slate-800">{barangCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Bahan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gambar</TableHead>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead>Rasa</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Berat</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBahan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>Tidak ada bahan ditemukan</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBahan.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.gambar ? (
                          <img
                            src={item.gambar}
                            alt={item.nama}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{item.rasa || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.jenisProduk === "Makanan"
                              ? "border-green-200 text-green-700 bg-green-50"
                              : item.jenisProduk === "Minuman"
                              ? "border-blue-200 text-blue-700 bg-blue-50"
                              : "border-gray-200 text-gray-700 bg-gray-50"
                          }
                        >
                          {item.jenisProduk}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.berat}g</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.stok > 20
                              ? "border-green-200 text-green-700 bg-green-50"
                              : item.stok > 0
                              ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                              : "border-red-200 text-red-700 bg-red-50"
                          }
                        >
                          {item.stok} {(item as any).satuan || 'pcs'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBahan(item);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedBahan ? "Edit Bahan" : "Tambah Bahan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nama Bahan</label>
              <Input
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Nama produk"
              />
            </div>
            <div>
                <label className="text-sm font-medium">Jenis Bahan</label>
              <Select value={formData.jenisProduk} onValueChange={handleJenisChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Makanan">Makanan</SelectItem>
                  <SelectItem value="Minuman">Minuman</SelectItem>
                  <SelectItem value="Barang">Barang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.jenisProduk !== "Barang" && (
              <div>
                <label className="text-sm font-medium">Rasa</label>
                <Input
                  value={formData.rasa}
                  onChange={(e) => setFormData({ ...formData, rasa: e.target.value })}
                  placeholder="Rasa produk"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Berat (g)</label>
                <Input
                  type="number"
                  value={formData.berat}
                  onChange={(e) => setFormData({ ...formData, berat: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stok</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: Number(e.target.value) })}
                  />
                  <Select
                    value={formData.satuan}
                    onValueChange={(val) => setFormData({ ...formData, satuan: val })}
                  >
                    <SelectTrigger className="w-[120px]">
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
            <div>
              <label className="text-sm font-medium">Gambar</label>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-lg" />
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Deskripsi</label>
              <Input
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Deskripsi produk"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A776E] hover:bg-[#4A776E]/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {selectedBahan ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin menghapus produk &quot;{selectedBahan?.nama}&quot;?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
