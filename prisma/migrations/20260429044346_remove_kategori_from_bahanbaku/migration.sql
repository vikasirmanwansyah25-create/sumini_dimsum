/*
  Warnings:

  - You are about to drop the column `kategori` on the `BahanBaku` table. All the data in the column will be lost.

*/
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
    "gambar" TEXT,
    "deskripsi" TEXT,
    "cabangId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BahanBaku_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "Cabang" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BahanBaku" ("berat", "cabangId", "createdAt", "deskripsi", "gambar", "hargaBeli", "hargaJual", "id", "nama", "rasa", "stok") SELECT "berat", "cabangId", "createdAt", "deskripsi", "gambar", "hargaBeli", "hargaJual", "id", "nama", "rasa", "stok" FROM "BahanBaku";
DROP TABLE "BahanBaku";
ALTER TABLE "new_BahanBaku" RENAME TO "BahanBaku";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
