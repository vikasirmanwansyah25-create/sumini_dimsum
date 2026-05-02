import { prisma } from "../lib/prisma";

async function resetData() {
  console.log("Menghapus data transaksi...");
  await prisma.cartItem.deleteMany();
  await prisma.transaksi.deleteMany();
  
  console.log("Menghapus data produk...");
  await prisma.menu.deleteMany();
  
  console.log("Menambahkan produk baru...");
  const produkData = [
    { nama: "Keripik Pisang Original", rasa: "Original", berat: 150, harga: 25000, stok: 50, kategori: "Original" },
    { nama: "Keripik Pisang Keju", rasa: "Keju", berat: 150, harga: 28000, stok: 35, kategori: "Keju" },
    { nama: "Keripik Pisang Pedas", rasa: "Pedas", berat: 150, harga: 27000, stok: 40, kategori: "Pedas" },
    { nama: "Keripik Pisang Coklat", rasa: "Coklat", berat: 150, harga: 29000, stok: 25, kategori: "Coklat" },
    { nama: "Keripik Pisang Balado", rasa: "Balado", berat: 150, harga: 27500, stok: 30, kategori: "Balado" },
    { nama: "Keripik Pisang BBQ", rasa: "BBQ", berat: 150, harga: 28500, stok: 20, kategori: "BBQ" },
    { nama: "Keripik Pisang Manis", rasa: "Manis", berat: 150, harga: 26000, stok: 45, kategori: "Manis" },
    { nama: "Keripik Pisang Spesial", rasa: "Spesial", berat: 200, harga: 35000, stok: 15, kategori: "Spesial" },
  ];

  for (const data of produkData) {
    await prisma.menu.create({ data });
  }

  console.log("Reset selesai!");
  console.log("- User: tetap (tidak dihapus)");
  console.log("- Produk: " + produkData.length + " produk ditambahkan");
  console.log("- Transaksi: dihapus semua");
}

resetData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());