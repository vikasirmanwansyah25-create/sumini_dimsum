/*
  Warnings:

  - You are about to drop the `Produk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `hargaBeli` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `hargaJual` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `produkId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `rasa` on the `CartItem` table. All the data in the column will be lost.
  - Added the required column `harga` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kategori` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `menuId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Produk";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "BahanBaku" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "rasa" TEXT NOT NULL,
    "berat" INTEGER NOT NULL,
    "hargaBeli" INTEGER NOT NULL,
    "hargaJual" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL,
    "kategori" TEXT NOT NULL,
    "gambar" TEXT,
    "deskripsi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL,
    "tersedia" BOOLEAN NOT NULL DEFAULT true,
    "gambar" TEXT,
    "deskripsi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transaksiId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    CONSTRAINT "CartItem_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CartItem" ("id", "jumlah", "nama", "transaksiId") SELECT "id", "jumlah", "nama", "transaksiId" FROM "CartItem";
DROP TABLE "CartItem";
ALTER TABLE "new_CartItem" RENAME TO "CartItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
