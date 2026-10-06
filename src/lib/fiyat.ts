const yuvarla = (n: number) => Math.round(n * 100) / 100;

// İndirim oranı: indirimli fiyat / normal fiyat (indirim yoksa null)
export function indirimOrani(basePrice: number, salePrice: number | null): number | null {
  if (salePrice && basePrice > 0 && salePrice < basePrice) return salePrice / basePrice;
  return null;
}

// Müşterinin ödeyeceği birim fiyat (sepet ve sipariş bunu kullanır)
export function birimFiyat(
  urun: { basePrice: unknown; salePrice: unknown },
  varyant?: { price: unknown } | null
): number {
  const taban = Number(urun.basePrice);
  const indirimli = urun.salePrice != null ? Number(urun.salePrice) : null;
  if (!varyant) return indirimli ?? taban;

  const oran = indirimOrani(taban, indirimli);
  const liste = Number(varyant.price);
  return oran ? yuvarla(liste * oran) : liste;
}