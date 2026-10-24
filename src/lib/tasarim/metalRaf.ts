// Kendin Tasarla: metal raf (çelik raf sistemi) modeli.
// L profil dikmeler ve aralarına civatalanan raflar. Yan yana bölmeler dikmeleri paylaşır (ek ünite mantığı).
// Hem tarayıcıda hem sunucuda çalışır, ölçüler milimetre (mm).

import { FIYATLAR, METAL_RENKLER, RENKLER, type MetalRenk, type RenkKodu } from "./fiyatlar";
import { levhaAlani, levhaBirim, m2, renkSec, satisFiyati, sayi, sinirla, adimla, type Parca } from "./ortak";

export type RafMalzeme = "sac" | "ahsap";

export const METAL_RAF_SINIRLARI = {
  genislikler: [60, 75, 90, 100, 120], // cm, bir bölmenin genişliği
  derinlikler: [30, 40, 50, 60], // cm
  yukseklik: { min: 100, max: 250, adim: 10 }, // cm
  maxBolme: 5,
  minRaf: 2,
  minRafAraligi: 250, // mm
};

export const METAL_RAF_RENKLERI: MetalRenk[] = ["galvaniz", "beyaz", "siyah", "antrasit"];

const P = 35; // mm dikme profili
const ILK_RAF = 80; // mm: en alt raf yerden

export type MetalRafSecim = {
  genislik: number; // cm, bölme başına
  derinlik: number; // cm
  yukseklik: number; // cm
  bolme: number;
  raf: number; // bölme başına raf sayısı
  rafMalzeme: RafMalzeme;
  renk: MetalRenk;
  ahsapRenk: RenkKodu; // ahşap raflarda tabla rengi
};

export const VARSAYILAN_METAL_RAF: MetalRafSecim = {
  genislik: 90,
  derinlik: 40,
  yukseklik: 200,
  bolme: 1,
  raf: 5,
  rafMalzeme: "sac",
  renk: "galvaniz",
  ahsapRenk: "mese",
};

export function metalRafMaxRaf(yukseklikCm: number) {
  const H = yukseklikCm * 10;
  return Math.max(METAL_RAF_SINIRLARI.minRaf, Math.floor((H - ILK_RAF - 20) / METAL_RAF_SINIRLARI.minRafAraligi) + 1);
}

export function metalRafDuzelt(girdi: unknown): MetalRafSecim {
  const g = (girdi ?? {}) as Partial<Record<keyof MetalRafSecim, unknown>>;
  const S = METAL_RAF_SINIRLARI;
  const V = VARSAYILAN_METAL_RAF;
  const gen = sayi(g.genislik, V.genislik);
  const der = sayi(g.derinlik, V.derinlik);
  const yukseklik = sinirla(adimla(sayi(g.yukseklik, V.yukseklik), S.yukseklik.adim), S.yukseklik.min, S.yukseklik.max);
  return {
    genislik: S.genislikler.includes(gen) ? gen : V.genislik,
    derinlik: S.derinlikler.includes(der) ? der : V.derinlik,
    yukseklik,
    bolme: sinirla(Math.floor(sayi(g.bolme, V.bolme)), 1, S.maxBolme),
    raf: sinirla(Math.floor(sayi(g.raf, V.raf)), S.minRaf, metalRafMaxRaf(yukseklik)),
    rafMalzeme: g.rafMalzeme === "ahsap" ? "ahsap" : "sac",
    renk: METAL_RAF_RENKLERI.includes(g.renk as MetalRenk) ? (g.renk as MetalRenk) : V.renk,
    ahsapRenk: renkSec(g.ahsapRenk, V.ahsapRenk),
  };
}

export const metalRafToplamGenislik = (s: MetalRafSecim) => s.genislik * s.bolme;

export function metalRafParcalari(s: MetalRafSecim): Parca[] {
  const W = s.genislik * 10;
  const D = s.derinlik * 10;
  const H = s.yukseklik * 10;
  const Wt = W * s.bolme;
  const p: Parca[] = [];
  const ekle = (x: Omit<Parca, "grup" | "malzeme"> & { malzeme?: Parca["malzeme"] }) =>
    p.push({ malzeme: "metal", grup: 0, ...x });

  // Dikmeler: her bölme sınırında önde ve arkada birer tane
  for (let i = 0; i <= s.bolme; i++) {
    const x = -Wt / 2 + i * W + (i === 0 ? P / 2 : i === s.bolme ? -P / 2 : 0);
    for (const zt of [-1, 1]) {
      const z = zt * (D / 2 - P / 2);
      ekle({ tur: "dikme", ad: "Dikme (L profil)", en: P, boy: H - 10, derinlik: P, x, y: 10 + (H - 10) / 2, z, bantMm: 0 });
      ekle({ tur: "ayak", ad: "Plastik ayak", en: P + 4, boy: 10, derinlik: P + 4, x, y: 5, z, bantMm: 0, malzeme: "delik" });
    }
  }

  // Raflar: en alttaki yerden 8 cm, en üstteki dikmenin tepesinde, arası eşit
  const ust = H - 20;
  const aralik = s.raf > 1 ? (ust - ILK_RAF) / (s.raf - 1) : 0;
  for (let b = 0; b < s.bolme; b++) {
    const x0 = -Wt / 2 + b * W;
    // Raf iki dikmenin iç yüzleri arasında kalır (kenar dikmeler tam, aradakiler yarım pay alır)
    const sol = x0 + (b === 0 ? P : P / 2);
    const sag = x0 + W - (b === s.bolme - 1 ? P : P / 2);
    const rafW = sag - sol;
    const icX = (sol + sag) / 2;
    for (let r = 0; r < s.raf; r++) {
      const y = ILK_RAF + r * aralik;
      if (s.rafMalzeme === "sac") {
        ekle({ tur: "sacRaf", ad: "Sac raf", en: rafW, boy: 2, derinlik: D - 4, x: icX, y, z: 0, bantMm: 0 });
        for (const zt of [-1, 1]) {
          ekle({ tur: "sacKenar", ad: "Sac raf kenarı", en: rafW, boy: 30, derinlik: 2, x: icX, y: y - 14, z: zt * (D / 2 - 3), bantMm: 0, gosterim: true });
        }
      } else {
        for (const zt of [-1, 1]) {
          ekle({ tur: "kiris", ad: "Metal kiriş", en: rafW, boy: 35, derinlik: 20, x: icX, y: y - 17, z: zt * (D / 2 - 12), bantMm: 0 });
        }
        ekle({ tur: "ahsapRaf", ad: "Ahşap raf (18 mm)", en: rafW, boy: 18, derinlik: D - 10, x: icX, y: y + 9, z: 0, bantMm: rafW, malzeme: "govde" });
      }
    }
  }
  return p;
}

export function metalRafFiyat(s: MetalRafSecim) {
  const F = FIYATLAR;
  const parcalar = metalRafParcalari(s).filter((x) => !x.gosterim);
  const boya = s.renk === "galvaniz" ? 1 : F.boyaCarpani;

  let dikmeM = 0;
  let sacM2 = 0;
  let kirisM = 0;
  let ahsapM2 = 0;
  let bantMm = 0;
  for (const x of parcalar) {
    if (x.tur === "dikme") dikmeM += x.boy / 1000;
    else if (x.tur === "sacRaf") sacM2 += m2(x.en, x.derinlik);
    else if (x.tur === "kiris") kirisM += x.en / 1000;
    else if (x.tur === "ahsapRaf") {
      ahsapM2 += levhaAlani(x);
      bantMm += x.bantMm;
    }
  }
  const raflar = s.raf * s.bolme;
  const dikmeler = (s.bolme + 1) * 2;
  const metal = (dikmeM * F.metalDikmeM + sacM2 * F.sacRafM2 + kirisM * F.metalKirisM) * boya;
  const ahsap = ahsapM2 * (1 + F.fireOrani) * levhaBirim(s.ahsapRenk) + (bantMm / 1000) * 1.1 * F.bantM;
  const donanim = raflar * F.rafCivata + dikmeler * F.plastikAyak;
  const iscilik = F.metalRafIscilik + raflar * 15 + ahsapM2 * F.iscilikM2;
  const ambalaj = F.metalRafAmbalaj + s.bolme * 40;

  const maliyet = metal + ahsap + donanim + iscilik + ambalaj;
  return { maliyet: Math.round(maliyet), fiyat: satisFiyati(maliyet) };
}

export function metalRafOzeti(s: MetalRafSecim) {
  const x = [
    `${metalRafToplamGenislik(s)}×${s.derinlik}×${s.yukseklik} cm`,
    `${s.bolme} bölme`,
    `bölme başı ${s.raf} raf`,
    s.rafMalzeme === "sac" ? "sac raf" : `ahşap raf (${RENKLER[s.ahsapRenk].ad.toLocaleLowerCase("tr-TR")})`,
    METAL_RENKLER[s.renk].ad.toLocaleLowerCase("tr-TR"),
  ];
  return x.join(" · ");
}
