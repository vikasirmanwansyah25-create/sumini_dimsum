"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, MapPin, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Cabang {
  id: string;
  nama: string;
  alamat: string | null;
  telepon: string | null;
  createdAt: string;
  _count?: {
    bahanBaku: number;
  };
}

export default function CabangPage() {
  const [cabang, setCabang] = React.useState<Cabang[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedCabang, setSelectedCabang] = React.useState<Cabang | null>(null);

  const [formData, setFormData] = React.useState({
    nama: "",
    alamat: "",
    telepon: "",
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/cabang");
      const json = await res.json();
      if (json.success) setCabang(json.data);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Gagal memuat data cabang");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (c?: Cabang) => {
    if (c) {
      setSelectedCabang(c);
      setFormData({
        nama: c.nama,
        alamat: c.alamat || "",
        telepon: c.telepon || "",
      });
    } else {
      setSelectedCabang(null);
      setFormData({ nama: "", alamat: "", telepon: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nama) {
      alert("Nama cabang wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const url = selectedCabang
        ? `/api/cabang/${selectedCabang.id}`
        : "/api/cabang";
      const method = selectedCabang ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        if (selectedCabang) {
          setCabang(cabang.map((c) => (c.id === selectedCabang.id ? json.data : c)));
        } else {
          setCabang([json.data, ...cabang]);
        }
        setIsDialogOpen(false);
      } else {
        alert(json.message || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCabang) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/cabang/${selectedCabang.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setCabang(cabang.filter((c) => c.id !== selectedCabang.id));
        setIsDeleteDialogOpen(false);
      } else {
        alert(json.message || "Gagal menghapus data");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Kelola Cabang</h1>
          <p className="text-sm text-slate-500 mt-1">Manajemen data cabang dan alamat</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#4A776E] hover:bg-[#4A776E]/90 text-white w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Cabang
        </Button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-xs font-semibold text-slate-600">Nama Cabang</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">Alamat</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">Telepon</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">Bahan Baku</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-[#26B0AC]" />
                      <p className="text-sm text-slate-500">Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : cabang.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-8 w-8 text-slate-300" />
                      <p className="text-sm text-slate-500">Belum ada data cabang</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                cabang.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="font-medium text-sm text-slate-900">{c.nama}</div>
                    </TableCell>
                    <TableCell>
                      {c.alamat ? (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-sm text-slate-600 leading-relaxed">{c.alamat}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Belum diisi</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.telepon ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm text-slate-600">{c.telepon}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Belum diisi</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium text-xs">
                        {c._count?.bahanBaku || 0} item
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(c)}
                          className="h-8 w-8 p-0 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCabang(c);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {selectedCabang ? "Edit Cabang" : "Tambah Cabang Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nama Cabang</label>
              <Input
                placeholder="Masukkan nama cabang"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="focus:ring-[#26B0AC] focus:border-[#26B0AC]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Alamat Lengkap</label>
              <Textarea
                placeholder="Masukkan alamat lengkap cabang"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="min-h-[100px] focus:ring-[#26B0AC] focus:border-[#26B0AC] resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nomor Telepon</label>
              <Input
                placeholder="Masukkan nomor telepon"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                className="focus:ring-[#26B0AC] focus:border-[#26B0AC]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#4A776E] hover:bg-[#4A776E]/90 text-white"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedCabang ? "Simpan Perubahan" : "Tambah Cabang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Hapus Cabang
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              Yakin ingin menghapus cabang <span className="font-semibold">{selectedCabang?.nama}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
