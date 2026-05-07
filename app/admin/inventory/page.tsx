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
import { uploadImageToCloudinary } from "@/lib/cloudinary";

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
        else console.error("Gagal fetch bahan:", bahanJson.message);
        if (cabangJson.success) setCabang(cabangJson.data);
        else console.error("Gagal fetch cabang:", cabangJson.message);
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
    jenisProduk: "Frozen Food",
    cabangId: "",
    satuan: "pcs",
  });
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [uploading, setUploading] = React.useState(false);
  const [showImagePreview, setShowImagePreview] = React.useState(false);

  const handleOpenDialog = (p?: BahanBaku) => {
    if (p) {
      setSelectedBahan(p);
      setFormData({
        nama: p.nama || "",
        rasa: p.rasa || "",
        berat: p.berat || 150,
        stok: p.stok || 0,
        gambar: p.gambar || "",
        deskripsi: p.deskripsi || "",
        jenisProduk: p.jenisProduk || "Makanan",
        cabangId: p.cabangId || "",
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
        jenisProduk: "Frozen Food",
        cabangId: (filterCabang && filterCabang !== "all") ? filterCabang : (cabang[0]?.id || ""),
        satuan: "pcs",
      });
      setImagePreview("");
    }
    setIsDialogOpen(true);
  };

  const handleJenisChange = (jenis: string) => {
    setFormData({ ...formData, jenisProduk: jenis, rasa: ["Pengemasan", "Operasional"].includes(jenis) ? "" : formData.rasa });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setImagePreview(imageUrl);
      setFormData({ ...formData, gambar: imageUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Gagal upload gambar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredBahan = bahanBaku.filter((p) => {
    const matchesSearch =
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.rasa && p.rasa.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCabang = filterCabang === "all" || p.cabangId === filterCabang;
    return matchesSearch && matchesCabang;
  });

  const handleSave = async () => {
    // Validasi nama wajib diisi
    if (!formData.nama.trim()) {
      alert("Nama bahan wajib diisi");
      return;
    }

    // Validasi cabang wajib dipilih (hanya untuk tambah baru)
    if (!selectedBahan && !formData.cabangId) {
      alert("Cabang wajib dipilih");
      return;
    }

    // Validasi rasa wajib untuk Frozen Food dan Topping
    if (["Frozen Food", "Topping"].includes(formData.jenisProduk) && !formData.rasa?.trim()) {
      alert("Rasa wajib diisi untuk jenis " + formData.jenisProduk);
      return;
    }

    // Validasi gambar wajib diupload
    if (!formData.gambar) {
      alert("Gambar wajib diupload");
      return;
    }

    // Validasi berat harus lebih dari 0
    if (!formData.berat || formData.berat <= 0) {
      alert("Berat harus diisi dan lebih dari 0");
      return;
    }

    // Validasi stok wajib diisi dan tidak boleh negatif
    if (formData.stok === undefined || formData.stok === null || formData.stok < 0) {
      alert("Stok wajib diisi dan tidak boleh negatif");
      return;
    }

    // Validasi satuan wajib dipilih
    if (!formData.satuan) {
      alert("Satuan wajib dipilih");
      return;
    }

    // Validasi deskripsi wajib diisi
    if (!formData.deskripsi?.trim()) {
      alert("Deskripsi wajib diisi");
      return;
    }

     setSaving(true);
    try {
      if (selectedBahan) {
        // Jangan kirim cabangId saat update karena tidak boleh diubah
        const { cabangId, ...updateData } = formData;
        const res = await fetch(`/api/bahan-baku/${selectedBahan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
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
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Inventory</h1>
          <p className="text-sm lg:text-base text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Kelola bahan baku
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#4A776E] hover:bg-[#4A776E]/90 text-white w-full sm:w-auto"
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
                   <TableHead className="text-xs font-semibold text-slate-600">Jenis</TableHead>
                   <TableHead className="text-xs font-semibold text-slate-600">Cabang</TableHead>
                   <TableHead className="text-xs font-semibold text-slate-600">Stok</TableHead>
                   <TableHead className="text-xs font-semibold text-slate-600">Berat</TableHead>
                   <TableHead className="text-xs font-semibold text-slate-600">Edit</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-[#4A776E]" />
                        <p className="text-sm text-slate-500">Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredBahan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
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
                            className="h-10 w-10 rounded-lg object-cover border border-slate-100 cursor-pointer hover:opacity-80 transition"
                            onClick={() => {
                              setImagePreview(p.gambar || "");
                              setShowImagePreview(true);
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-sm text-slate-900">{p.nama}</TableCell>
                       <TableCell>
                         <Badge
                           variant="secondary"
                           className="bg-slate-100 text-slate-700 font-medium text-[10px]"
                         >
                           {p.rasa}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         <Badge
                           variant="outline"
                           className={
                             p.jenisProduk === "Frozen Food"
                               ? "border-green-200 text-green-700 bg-green-50"
                               : p.jenisProduk === "Topping"
                               ? "border-purple-200 text-purple-700 bg-purple-50"
                               : p.jenisProduk === "Pengemasan"
                               ? "border-blue-200 text-blue-700 bg-blue-50"
                               : p.jenisProduk === "Operasional"
                               ? "border-gray-200 text-gray-700 bg-gray-50"
                               : "border-yellow-200 text-yellow-700 bg-yellow-50"
                           }
                         >
                           {p.jenisProduk}
                         </Badge>
                       </TableCell>
<TableCell className="text-sm text-slate-600">
                          {(p.cabang?.nama || cabang.find(c => c.id === p.cabangId)?.nama) ? (
                            <div>
                              <div>{p.cabang?.nama || cabang.find(c => c.id === p.cabangId)?.nama}</div>
                              {(p.cabang?.alamat || cabang.find(c => c.id === p.cabangId)?.alamat) && (
                                <div className="text-xs text-slate-400">
                                  {p.cabang?.alamat || cabang.find(c => c.id === p.cabangId)?.alamat}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-yellow-600 text-xs">Cabang tidak ditemukan (ID: {p.cabangId})</span>
                          )}
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
                <label className="text-sm font-medium text-slate-700">Nama Bahan <span className="text-red-500">*</span></label>
                <Input
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Kulit Dimsum Premium"
                  className="h-10 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Jenis Bahan <span className="text-red-500">*</span></label>
                <Select
                  value={formData.jenisProduk}
                  onValueChange={handleJenisChange}
                >
                  <SelectTrigger className="h-10 border-slate-200">
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Frozen Food">Frozen Food</SelectItem>
                    <SelectItem value="Topping">Topping</SelectItem>
                    <SelectItem value="Pengemasan">Pengemasan</SelectItem>
                    <SelectItem value="Operasional">Operasional</SelectItem>
                    <SelectItem value="Penyedap">Penyedap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Rasa {!["Pengemasan", "Operasional"].includes(formData.jenisProduk) && <span className="text-red-500">*</span>}
                </label>
                <Input
                   value={formData.rasa}
                   onChange={(e) => setFormData({ ...formData, rasa: e.target.value })}
                   placeholder="Contoh: Original"
                   className="h-10 border-slate-200"
                   disabled={["Pengemasan", "Operasional"].includes(formData.jenisProduk)}
                 />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Gambar <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-3 lg:gap-4">
              <label className="cursor-pointer flex items-center gap-2 px-3 lg:px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-sm text-slate-600">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      id="upload-file"
                    />
                    <ImageIcon className="h-4 w-4" />
                    <span>Upload Gambar</span>
                  </>
                )}
              </label>
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-12 lg:h-14 w-12 lg:w-14 rounded-lg object-cover border border-slate-100 cursor-pointer hover:opacity-80 transition"
                  onClick={() => setShowImagePreview(true)}
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Cabang <span className="text-red-500">*</span></label>
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
                       setFormData({ ...formData, berat: parseFloat(e.target.value) || 0 })
                     }
                     className="h-10 border-slate-200"
                   />
              </div>
              <div className="space-y-1.5 col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-slate-700">Stok <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <Input
                     type="number"
                     value={formData.stok}
                     onChange={(e) =>
                       setFormData({ ...formData, stok: parseFloat(e.target.value) || 0 })
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
                         <SelectItem value="box">Box</SelectItem>
                         <SelectItem value="pack">Pack</SelectItem>
                         <SelectItem value="tabung">Tabung</SelectItem>
                         <SelectItem value="galon">Galon</SelectItem>
                         <SelectItem value="set">Set</SelectItem>
                         <SelectItem value="roll">Roll</SelectItem>
                         <SelectItem value="botol">Botol</SelectItem>
                       </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Deskripsi <span className="text-red-500">*</span></label>
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

       {/* Dialog Preview Gambar */}
       <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
         <DialogContent className="max-w-2xl sm:max-w-3xl border-slate-200 p-2">
           <DialogHeader>
             <DialogTitle className="sr-only">Preview Gambar</DialogTitle>
           </DialogHeader>
           <div className="relative">
             <img
               src={imagePreview}
               alt="Preview"
               className="w-full h-auto rounded-lg"
             />
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 }

