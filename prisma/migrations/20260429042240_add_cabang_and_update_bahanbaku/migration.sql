/*
  Warnings:

  - Added the required column `cabangId` to the `BahanBaku` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Cabang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "telepon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BahanBaku" (
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
    "cabangId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BahanBaku_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "Cabang" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BahanBaku" ("berat", "createdAt", "deskripsi", "gambar", "hargaBeli", "hargaJual", "id", "kategori", "nama", "rasa", "stok") SELECT "berat", "createdAt", "deskripsi", "gambar", "hargaBeli", "hargaJual", "id", "kategori", "nama", "rasa", "stok" FROM "BahanBaku";
DROP TABLE "BahanBaku";
ALTER TABLE "new_BahanBaku" RENAME TO "BahanBaku";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
