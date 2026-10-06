import { prisma } from "@/lib/prisma";

// Sipariş kalemlerindeki ürünlerin fotoğraf, adres ve kod bilgilerini getirir
export async function siparisUrunBilgisi(ids: number[]) {
  const urunler = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      slug: true,
      sku: true,
      isActive: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });

  return new Map(
    urunler.map((u) => [
      u.id,
      { slug: u.slug, sku: u.sku, aktif: u.isActive, resim: u.images[0]?.url ?? null },
    ]),
  );
}