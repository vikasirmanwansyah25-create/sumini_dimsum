/*
  Warnings:

  - Added the required column `hargaBeli` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metodePembayaran` to the `Transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pajak` to the `Transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Transaksi` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transaksiId" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "rasa" TEXT NOT NULL,
    "hargaJual" INTEGER NOT NULL,
    "hargaBeli" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    CONSTRAINT "CartItem_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CartItem" ("hargaJual", "id", "jumlah", "nama", "produkId", "rasa", "transaksiId") SELECT "hargaJual", "id", "jumlah", "nama", "produkId", "rasa", "transaksiId" FROM "CartItem";
DROP TABLE "CartItem";
ALTER TABLE "new_CartItem" RENAME TO "CartItem";
CREATE TABLE "new_Transaksi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "pajak" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "metodePembayaran" TEXT NOT NULL,
    "bayar" INTEGER NOT NULL,
    "kembalian" INTEGER NOT NULL,
    "catatan" TEXT,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Transaksi" ("bayar", "id", "kembalian", "tanggal", "total", "userId") SELECT "bayar", "id", "kembalian", "tanggal", "total", "userId" FROM "Transaksi";
DROP TABLE "Transaksi";
ALTER TABLE "new_Transaksi" RENAME TO "Transaksi";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
