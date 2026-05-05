"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Shield, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/utils";
import { UserRole, Cabang } from "@/lib/types";

export default function UsersPage() {
  const { users, fetchUsers, addUser, updateUser, deleteUser } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [cabangList, setCabangList] = React.useState<Cabang[]>([]);
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
    nama: "",
    role: "KASIR" as UserRole,
    cabangId: "",
  });

  React.useEffect(() => {
    fetchUsers();
    fetchCabang();
  }, [fetchUsers]);

  const fetchCabang = async () => {
    try {
      const res = await fetch("/api/cabang");
      if (!res.ok) {
        console.error("Failed to fetch cabang, status:", res.status);
        return;
      }
      const json = await res.json();
      console.log("Cabang response:", json);
      const list = json.data || json.cabang || [];
      setCabangList(list);
      if (list.length === 0) {
        console.warn("No cabang data found. Please add branches first.");
      }
    } catch (err) {
      console.error("Gagal mengambil data cabang", err);
    }
  };

  const handleOpenDialog = (userId?: string) => {
    if (userId) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setSelectedUserId(userId);
        setFormData({
          username: user.username,
          password: user.password,
          nama: user.nama,
          role: user.role,
          cabangId: user.cabangId || "",
        });
      }
    } else {
      setSelectedUserId(null);
      setFormData({
        username: "",
        password: "",
        nama: "",
        role: "KASIR",
        cabangId: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.nama || (!selectedUserId && !formData.password)) {
      alert("Mohon lengkapi semua field");
      return;
    }

    if (formData.role === "KASIR" && !formData.cabangId) {
      alert("Mohon pilih cabang untuk kasir. Jika belum ada cabang, tambahkan terlebih dahulu di menu Cabang.");
      return;
    }

    setIsLoading(true);
    try {
      if (selectedUserId) {
        const { password, ...updateData } = formData;
        await updateUser(selectedUserId, updateData);
      } else {
        await addUser(formData);
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan user");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (selectedUserId) {
      setIsLoading(true);
      try {
        await deleteUser(selectedUserId);
        setIsDeleteDialogOpen(false);
        setSelectedUserId(null);
      } catch (err: any) {
        alert(err.message || "Gagal menghapus user");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-charcoal-800">
            User Management
          </h1>
          <p className="text-xs lg:text-sm text-charcoal-500">Kelola akun kasir</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah User
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-3 lg:p-4 bg-navy-100 rounded-xl">
                <Shield className="h-5 lg:h-8 w-5 lg:w-8 text-navy-700" />
              </div>
              <div>
                <p className="text-xs lg:text-sm text-charcoal-500">Admin</p>
                <p className="text-xl lg:text-2xl font-bold">
                  {users.filter((u) => u.role === "ADMIN").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-3 lg:p-4 bg-blue-100 rounded-xl">
                <User className="h-5 lg:h-8 w-5 lg:w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm text-charcoal-500">Kasir</p>
                <p className="text-xl lg:text-2xl font-bold">
                  {users.filter((u) => u.role === "KASIR").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm lg:text-base">Daftar User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id || `user-${index}`}>
                  <TableCell className="font-medium">
                    @{user.username}
                  </TableCell>
                  <TableCell>{user.nama}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === "KASIR" ? (user.cabang?.nama || "-") : "-"}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(user.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedUserId ? "Edit User" : "Tambah User Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 lg:gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                className="flex h-10 lg:h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-2"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Contoh: nama_kasir"
              />
            </div>
            {!selectedUserId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  className="flex h-10 lg:h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-2"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Masukkan password"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <input
                className="flex h-10 lg:h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-2"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Contoh: John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={formData.role}
                onValueChange={(val) =>
                  setFormData({ ...formData, role: val as UserRole, cabangId: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="KASIR">Kasir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role === "KASIR" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cabang</label>
                {cabangList.length === 0 ? (
                  <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                    Belum ada data cabang. Silakan tambahkan cabang terlebih dahulu di menu Cabang.
                  </div>
                ) : (
                  <Select
                    value={formData.cabangId || ""}
                    onValueChange={(val) =>
                      setFormData({ ...formData, cabangId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Cabang" />
                    </SelectTrigger>
                    <SelectContent>
                      {cabangList.map((cabang) => (
                        <SelectItem key={cabang.id} value={cabang.id}>
                          {cabang.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
          </DialogHeader>
          <p className="py-3 lg:4">
            Apakah Anda yakin ingin menghapus user ini?
          </p>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
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