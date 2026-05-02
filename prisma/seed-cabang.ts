import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing cabang
  await prisma.$executeRaw`DELETE FROM Cabang WHERE id LIKE 'cabang-%'`;
  
  // Add cabang data
  await prisma.cabang.createMany({
    data: [
      { id: "cabang-tulangan", nama: "Tulangan", alamat: "Jl. Raya Tulangan", telepon: "081234567890" },
      { id: "cabang-gresik", nama: "Gresik", alamat: "Jl. Gresik", telepon: "081234567891" },
      { id: "cabang-lumajang", nama: "Lumajang", alamat: "Jl. Lumajang", telepon: "081234567892" },
    ],
  });

  console.log("✅ Cabang data added successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
