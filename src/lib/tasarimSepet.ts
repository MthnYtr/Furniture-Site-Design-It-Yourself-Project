import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { tasarimCoz, type TasarimTuru } from "@/lib/tasarim/kayit";

// Kendin Tasarla ürünleri normal sepetten ayrı bir çerezde tutulur.
// Sadece tür ve tasarım sorgusu saklanır; fiyat her seferinde sunucuda yeniden hesaplanır.
export type TasarimSatiri = { id: string; t: TasarimTuru; c: string; q: number };

const COOKIE = "tasarim_sepet";
export const MAX_TASARIM = 6; // çerez boyutu sınırı için
export const MAX_TASARIM_ADET = 10;

export async function getTasarimSepet(): Promise<TasarimSatiri[]> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((x) => x && typeof x.id === "string" && tasarimCoz(x.t, x.c))
      .slice(0, MAX_TASARIM)
      .map((x) => ({
        id: String(x.id).slice(0, 12),
        t: x.t as TasarimTuru,
        c: String(x.c),
        q: Math.min(MAX_TASARIM_ADET, Math.max(1, Math.floor(Number(x.q)) || 1)),
      }));
  } catch {
    return [];
  }
}

// Sadece sunucu işlemlerinde (server action) çağrılabilir
export async function saveTasarimSepet(items: TasarimSatiri[]) {
  (await cookies()).set(COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export const yeniTasarimId = () => randomUUID().replace(/-/g, "").slice(0, 10);

// Sepet sayfası ve ödeme için: her satırın güncel fiyatı ve özeti
export async function tasarimSatirlari() {
  const sepet = await getTasarimSepet();
  return sepet.flatMap((s) => {
    const c = tasarimCoz(s.t, s.c);
    return c ? [{ ...s, ...c, toplam: c.fiyat * s.q }] : [];
  });
}
