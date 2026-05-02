import { prisma } from "../lib/prisma";

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers === 0) {
    await prisma.user.createMany({
      data: [
        { username: "admin", password: "admin123", nama: "Administrator", role: "ADMIN" },
        { username: "sarah_kasir", password: "sarah123", nama: "Sarah Kasir", role: "KASIR" },
      ],
    });
    console.log("2 user accounts created");
  }

  const cabangData = [
    {
      nama: "Sumini Dimsum - Sepanjang",
      alamat: "Jl. H Husein Idris No.8, Bebekan, Kec.Taman, Sidoarjo, Jawa Timur 61257",
      telepon: "-",
    },
    {
      nama: "Sumini Dimsum - Porong",
      alamat: "Jl. Bhayangkari, Juwetkenongo Porong, Sidoarjo, Jawa Timur  61257",
      telepon: "-",
    },
    {
      nama: "Sumini Dimsum - Tulangan",
      alamat: "Jl. Raya Tulangan No.13, Kabupaten Sidoarjo, Jawa Timur 61273",
      telepon: "-",
    },
  ];

  for (const cabang of cabangData) {
    const existing = await prisma.cabang.findFirst({
      where: { nama: cabang.nama },
    });
    
    if (!existing) {
      await prisma.cabang.create({ data: cabang });
      console.log(`Cabang ${cabang.nama} created`);
    } else {
      await prisma.cabang.update({
        where: { id: existing.id },
        data: cabang,
      });
      console.log(`Cabang ${cabang.nama} updated`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
