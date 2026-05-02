-- CreateTable
CREATE TABLE "Resep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "menuId" TEXT NOT NULL,
    "bahanBakuId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    CONSTRAINT "Resep_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Resep_bahanBakuId_fkey" FOREIGN KEY ("bahanBakuId") REFERENCES "BahanBaku" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
