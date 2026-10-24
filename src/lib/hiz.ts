import { headers } from "next/headers";

type Kayit = { sayi: number; ilk: number; kilitBitis: number };

// Dev modunda dosya yenilense de sayaç kaybolmasın
const g = globalThis as unknown as { __hizDeposu?: Map<string, Kayit> };
const depo = (g.__hizDeposu ??= new Map<string, Kayit>());

type Kural = { limit: number; pencereMs: number; kilitMs: number };

function temizle(simdi: number) {
  if (depo.size < 500) return;
  for (const [k, v] of depo) {
    if (v.kilitBitis < simdi && simdi - v.ilk > 60 * 60 * 1000) depo.delete(k);
  }
}

// Kilitliyse kaç dakika beklemesi gerektiğini döner, değilse 0
export function kilitDakika(anahtar: string): number {
  const k = depo.get(anahtar);
  const simdi = Date.now();
  if (k && k.kilitBitis > simdi) return Math.ceil((k.kilitBitis - simdi) / 60000);
  return 0;
}

// Başarısız denemeyi kaydeder, limit aşılırsa kilitler
export function basarisizKaydet(anahtar: string, kural: Kural) {
  const simdi = Date.now();
  temizle(simdi);
  let k = depo.get(anahtar);
  if (!k || simdi - k.ilk > kural.pencereMs) {
    k = { sayi: 0, ilk: simdi, kilitBitis: 0 };
  }
  k.sayi += 1;
  if (k.sayi >= kural.limit) {
    k.kilitBitis = simdi + kural.kilitMs;
    k.sayi = 0;
    k.ilk = simdi;
  }
  depo.set(anahtar, k);
}

export function sifirla(anahtar: string) {
  depo.delete(anahtar);
}

// Sunucuda nginx X-Real-IP başlığını ayarlayacak (yayın adımında yapacağız)
export async function istemciIp(): Promise<string> {
  const h = await headers();
  const gercek = h.get("x-real-ip");
  if (gercek) return gercek.trim();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",").pop()!.trim();
  return "bilinmiyor";
}