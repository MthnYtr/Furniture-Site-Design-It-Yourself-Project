// Kendin Tasarla ürünlerinin tek listesi.
// Sepet, sipariş ve admin bu dosya üzerinden bir tasarımı adresteki sorgudan (?g=80&...) okur,
// fiyatını sunucuda yeniden hesaplar, özetini ve kesim listesini çıkarır.

import { METAL_RENKLER, RENKLER, TEZGAH_RENKLERI } from "./fiyatlar";
import { fiyatHesapla, modulleriOku, onRengi, parcalariHesapla, secimDuzelt, secimOzeti } from "./kitaplik";
import { masaDuzelt, masaFiyat, masaOzeti, masaParcalari } from "./masa";
import { dolapDuzelt, dolapFiyat, dolapOnRengi, dolapOzeti, dolapParcalari, siraOku } from "./dolap";
import { metalRafDuzelt, metalRafFiyat, metalRafOzeti, metalRafParcalari } from "./metalRaf";
import {
  ayakkabilikDuzelt,
  ayakkabilikFiyat,
  ayakkabilikOnRengi,
  ayakkabilikOzeti,
  ayakkabilikParcalari,
} from "./ayakkabilik";
import type { Parca } from "./ortak";

export type TasarimTuru = "kitaplik" | "masa" | "mutfak" | "banyo" | "metal-raf" | "ayakkabilik";

// Kesim listesinde malzeme adları için
export type MalzemeAdlari = { govde: string; on: string; tezgah?: string; metal?: string };

type Kayit<S> = {
  ad: string;
  oku: (q: URLSearchParams) => S;
  fiyat: (s: S) => number;
  ozet: (s: S) => string[];
  parcalar: (s: S) => Parca[];
  malzemeler: (s: S) => MalzemeAdlari;
};

const al = (q: URLSearchParams, k: string) => q.get(k) ?? undefined;
const evet = (q: URLSearchParams, k: string) => (q.get(k) === null ? undefined : q.get(k) === "1");

const kitaplik: Kayit<ReturnType<typeof secimDuzelt>> = {
  ad: "Kitaplık / Dolap",
  oku: (q) =>
    secimDuzelt({
      derinlik: al(q, "d"),
      renk: al(q, "renk"),
      kapakRenk: al(q, "kr"),
      kulp: al(q, "kulp"),
      moduller: modulleriOku(al(q, "m")),
      arkalik: evet(q, "a"),
      baza: evet(q, "b"),
    }),
  fiyat: (s) => fiyatHesapla(s).fiyat,
  ozet: (s) => {
    const o = secimOzeti(s);
    return [o.genel, ...o.moduller];
  },
  parcalar: parcalariHesapla,
  malzemeler: (s) => ({ govde: RENKLER[s.renk].ad, on: RENKLER[onRengi(s)].ad }),
};

const masa: Kayit<ReturnType<typeof masaDuzelt>> = {
  ad: "Çalışma Masası",
  oku: (q) =>
    masaDuzelt({
      genislik: al(q, "g"),
      derinlik: al(q, "d"),
      yukseklik: al(q, "y"),
      ayak: al(q, "ayak"),
      metalRenk: al(q, "mr"),
      renk: al(q, "renk"),
      cekmece: al(q, "c"),
      cekmeceSayi: al(q, "cs"),
      onPanel: evet(q, "op"),
      kabloDeligi: evet(q, "kd"),
      kulp: al(q, "kulp"),
    }),
  fiyat: (s) => masaFiyat(s).fiyat,
  ozet: (s) => [masaOzeti(s)],
  parcalar: masaParcalari,
  malzemeler: (s) => ({ govde: RENKLER[s.renk].ad, on: RENKLER[s.renk].ad, metal: METAL_RENKLER[s.metalRenk].ad }),
};

function dolapKaydi(tur: "mutfak" | "banyo"): Kayit<ReturnType<typeof dolapDuzelt>> {
  return {
    ad: tur === "mutfak" ? "Mutfak Dolabı" : "Banyo Dolabı",
    oku: (q) =>
      dolapDuzelt(
        {
          renk: al(q, "renk"),
          kapakRenk: al(q, "kr"),
          kulp: al(q, "kulp"),
          tezgah: al(q, "tz"),
          asma: evet(q, "asma"),
          altlar: siraOku(al(q, "a")),
          ustler: siraOku(al(q, "u")),
          sekil: al(q, "sk"),
          kose: al(q, "ko"),
          koseTur: al(q, "kt"),
          koseUst: evet(q, "ku"),
          yanAltlar: siraOku(al(q, "ya")),
          yanUstler: siraOku(al(q, "yu")),
        },
        tur,
      ),
    fiyat: (s) => dolapFiyat(s).fiyat,
    ozet: (s) => {
      const o = dolapOzeti(s);
      return [o.genel, ...o.altlar, ...o.ustler];
    },
    parcalar: dolapParcalari,
    malzemeler: (s) => ({
      govde: RENKLER[s.renk].ad,
      on: RENKLER[dolapOnRengi(s)].ad,
      tezgah: TEZGAH_RENKLERI[s.tezgah].ad,
    }),
  };
}

const metalRaf: Kayit<ReturnType<typeof metalRafDuzelt>> = {
  ad: "Metal Raf",
  oku: (q) =>
    metalRafDuzelt({
      genislik: al(q, "g"),
      derinlik: al(q, "d"),
      yukseklik: al(q, "y"),
      bolme: al(q, "b"),
      raf: al(q, "r"),
      rafMalzeme: al(q, "rm"),
      renk: al(q, "renk"),
      ahsapRenk: al(q, "ar"),
    }),
  fiyat: (s) => metalRafFiyat(s).fiyat,
  ozet: (s) => [metalRafOzeti(s)],
  parcalar: metalRafParcalari,
  malzemeler: (s) => ({ govde: RENKLER[s.ahsapRenk].ad, on: RENKLER[s.ahsapRenk].ad, metal: METAL_RENKLER[s.renk].ad }),
};

const ayakkabilik: Kayit<ReturnType<typeof ayakkabilikDuzelt>> = {
  ad: "Ayakkabılık",
  oku: (q) =>
    ayakkabilikDuzelt({
      genislik: al(q, "g"),
      yukseklik: al(q, "y"),
      derinlik: al(q, "d"),
      tip: al(q, "tip"),
      renk: al(q, "renk"),
      kapakRenk: al(q, "kr"),
      kulp: al(q, "kulp"),
      ayak: al(q, "ayak"),
      minder: evet(q, "mi"),
    }),
  fiyat: (s) => ayakkabilikFiyat(s).fiyat,
  ozet: (s) => [ayakkabilikOzeti(s)],
  parcalar: ayakkabilikParcalari,
  malzemeler: (s) => ({ govde: RENKLER[s.renk].ad, on: RENKLER[ayakkabilikOnRengi(s)].ad }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TASARIMLAR: Record<TasarimTuru, Kayit<any>> = {
  kitaplik,
  masa,
  mutfak: dolapKaydi("mutfak"),
  banyo: dolapKaydi("banyo"),
  "metal-raf": metalRaf,
  ayakkabilik,
};

export const tasarimTuruMu = (t: unknown): t is TasarimTuru =>
  typeof t === "string" && Object.prototype.hasOwnProperty.call(TASARIMLAR, t);

// Ürün kodu (gizli "Kendin Tasarla" ürününün SKU'su)
export const tasarimSku = (tur: TasarimTuru) => `TASARIM-${tur.toUpperCase().replace("-", "")}`;
export const tasarimAdresi = (tur: TasarimTuru, sorgu: string) => `/kendin-tasarla/${tur}?${sorgu}`;

// Next.js sayfasının searchParams nesnesinden okuma
export function sayfaSorgusu(q: Record<string, string | string[] | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (typeof v === "string") p.set(k, v);
  return p;
}

export type CozulmusTasarim = {
  tur: TasarimTuru;
  ad: string;
  sorgu: string;
  fiyat: number;
  ozet: string[];
};

// Sepetteki ya da siparişteki bir tasarımı çözer. Bozuk/tanınmayan veri gelirse null döner.
export function tasarimCoz(tur: unknown, sorgu: unknown): CozulmusTasarim | null {
  if (!tasarimTuruMu(tur) || typeof sorgu !== "string" || sorgu.length > 2000) return null;
  try {
    const k = TASARIMLAR[tur];
    const s = k.oku(new URLSearchParams(sorgu));
    return { tur, ad: k.ad, sorgu, fiyat: k.fiyat(s), ozet: k.ozet(s) };
  } catch {
    return null;
  }
}

// Sipariş kaleminin config alanından tasarım bilgisini okur (tasarım değilse null)
export function tasarimBilgisi(config: unknown) {
  const c = config as { tasarim?: unknown; sorgu?: unknown; ozet?: unknown } | null;
  if (!c || !tasarimTuruMu(c.tasarim) || typeof c.sorgu !== "string") return null;
  const ozet = Array.isArray(c.ozet) ? c.ozet.map(String) : [];
  return { tur: c.tasarim, sorgu: c.sorgu, ozet, adres: tasarimAdresi(c.tasarim, c.sorgu) };
}
