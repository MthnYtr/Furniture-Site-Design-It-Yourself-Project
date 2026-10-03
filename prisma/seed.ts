import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const kategoriler = [
    { name: "Raflar", slug: "raflar" },
    { name: "Kitaplıklar", slug: "kitapliklar" },
    { name: "Çalışma Masaları", slug: "calisma-masalari" },
    { name: "Metal Raflar", slug: "metal-raflar" },
    { name: "Ahşap Raflar", slug: "ahsap-raflar" },
    { name: "Mutfak Dolapları", slug: "mutfak-dolaplari" },
    { name: "Banyo Dolapları", slug: "banyo-dolaplari" },
  ];

  for (const [i, k] of kategoriler.entries()) {
    await prisma.category.upsert({
      where: { slug: k.slug },
      update: {},
      create: { ...k, sortOrder: i },
    });
  }

  const urunler = [
    { name: "Meşe Duvar Rafı 80 cm", slug: "mese-duvar-rafi-80", sku: "RF-001", basePrice: 1290, salePrice: 1090, kategori: "ahsap-raflar" },
    { name: "Endüstriyel Metal Raf 5 Katlı", slug: "endustriyel-metal-raf-5", sku: "MR-001", basePrice: 2890, salePrice: null, kategori: "metal-raflar" },
    { name: "Ceviz Kitaplık 180 cm", slug: "ceviz-kitaplik-180", sku: "KT-001", basePrice: 6490, salePrice: 5790, kategori: "kitapliklar" },
    { name: "Çalışma Masası 120 cm", slug: "calisma-masasi-120", sku: "CM-001", basePrice: 4590, salePrice: null, kategori: "calisma-masalari" },
    { name: "Banyo Dolabı Aynalı", slug: "banyo-dolabi-aynali", sku: "BD-001", basePrice: 5290, salePrice: 4790, kategori: "banyo-dolaplari" },
    { name: "Mutfak Alt Dolabı 60 cm", slug: "mutfak-alt-dolabi-60", sku: "MD-001", basePrice: 3890, salePrice: null, kategori: "mutfak-dolaplari" },
  ];

  for (const u of urunler) {
    const kat = await prisma.category.findUniqueOrThrow({ where: { slug: u.kategori } });
    await prisma.product.upsert({
      where: { slug: u.slug },
      update: {},
      create: {
        name: u.name,
        slug: u.slug,
        sku: u.sku,
        basePrice: u.basePrice,
        salePrice: u.salePrice,
        stock: 10,
        categoryId: kat.id,
      },
    });
  }
}

main()
  .then(() => console.log("Örnek veriler eklendi."))
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());