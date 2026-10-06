export type Satir = { ad: string; deger: string };

// Veritabanındaki JSON'dan satırları oku
export function ozellikOku(attr: unknown, anahtar: "ozellikler" | "boyutlar"): Satir[] {
  if (!attr || typeof attr !== "object") return [];
  const liste = (attr as Record<string, unknown>)[anahtar];
  if (!Array.isArray(liste)) return [];
  return liste.flatMap((x) => {
    const o = x as { ad?: unknown; deger?: unknown };
    return typeof o?.ad === "string" && typeof o?.deger === "string"
      ? [{ ad: o.ad, deger: o.deger }]
      : [];
  });
}

// Admin'deki metin kutusundan ("Malzeme: Meşe" satırları) satırlara
export function metindenSatirlara(metin: string): Satir[] {
  return metin
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((s) => {
      const i = s.indexOf(":");
      if (i < 1) return [];
      const ad = s.slice(0, i).trim();
      const deger = s.slice(i + 1).trim();
      return ad && deger ? [{ ad, deger }] : [];
    });
}

// Satırları admin metin kutusu için tekrar metne çevir
export function satirlardanMetne(satirlar: Satir[]): string {
  return satirlar.map((s) => `${s.ad}: ${s.deger}`).join("\n");
}