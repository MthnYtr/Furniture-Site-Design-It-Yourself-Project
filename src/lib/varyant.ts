import { prisma } from "@/lib/prisma";

// Seçeneği olan üründe: Fiyat = en düşük seçenek fiyatı, Stok = seçenek stoklarının toplamı.
// İndirim oranı korunur.
export async function varyantSenkronla(productId: number) {
  const urun = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!urun || urun.variants.length === 0) return;

  const enDusuk = Math.min(...urun.variants.map((v) => Number(v.price)));
  const stok = urun.variants.reduce((t, v) => t + v.stock, 0);

  const taban = Number(urun.basePrice);
  const indirimli = urun.salePrice != null ? Number(urun.salePrice) : null;
  const oran = indirimli && taban > 0 && indirimli < taban ? indirimli / taban : null;

  await prisma.product.update({
    where: { id: productId },
    data: {
      basePrice: enDusuk,
      salePrice: oran ? Math.round(enDusuk * oran * 100) / 100 : null,
      stock: stok,
    },
  });
}