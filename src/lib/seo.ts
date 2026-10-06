export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const mutlakUrl = (yol: string) =>
  yol.startsWith("http") ? yol : `${SITE_URL}${yol.startsWith("/") ? "" : "/"}${yol}`;

// Uzun metni arama sonuçlarına uygun uzunluğa kısaltır
export function kisalt(metin: string | null | undefined, uzunluk = 155) {
  const t = (metin ?? "").replace(/\s+/g, " ").trim();
  return t.length > uzunluk ? t.slice(0, uzunluk - 1).trimEnd() + "…" : t;
}