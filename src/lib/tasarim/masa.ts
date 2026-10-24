// Kendin Tasarla: çalışma masası modeli.
// Kitaplık modelindeki gibi hem tarayıcıda hem sunucuda kullanılır, ölçüler milimetre (mm).

import { FIYATLAR, KULPLAR, METAL_RENKLER, RENKLER, type KulpKodu, type MetalRenk, type RenkKodu } from "./fiyatlar";
import {
  adimla,
  evetMi,
  kulpSec,
  levhaAlani,
  levhaBirim,
  m2,
  renkSec,
  satisFiyati,
  sayi,
  sinirla,
  type Parca,
} from "./ortak";

export type AyakTuru = "panel" | "metalU" | "metal4";
export type CekmeceYeri = "yok" | "sol" | "sag";

export const AYAK_TURLERI: { kod: AyakTuru; ad: string; aciklama: string }[] = [
  { kod: "panel", ad: "Panel ayak", aciklama: "Yanlar masayla aynı malzeme" },
  { kod: "metalU", ad: "Metal U ayak", aciklama: "İki yanda U profil" },
  { kod: "metal4", ad: "Metal 4 ayak", aciklama: "Köşelerde kare ayak" },
];

export const MASA_SINIRLARI = {
  genislik: { min: 80, max: 200, adim: 5 }, // cm
  derinlikler: [50, 60, 70, 80], // cm
  yukseklikler: [72, 74, 76], // cm, standart çalışma yüksekliği
  cekmeceMinGenislik: 100, // cm: çekmece ünitesiyle diz boşluğu en az 55-60 cm kalsın
  maxCekmece: 3,
};

export const TABLA_KALINLIK = 25; // mm
const T = 18; // mm gövde
const UNITE_GENISLIK = 400; // mm çekmece ünitesi
const UNITE_BAZA = 50; // mm
const PROFIL = 40; // mm metal profil

export type MasaSecim = {
  genislik: number; // cm
  derinlik: number; // cm
  yukseklik: number; // cm
  ayak: AyakTuru;
  metalRenk: MetalRenk;
  renk: RenkKodu;
  cekmece: CekmeceYeri;
  cekmeceSayi: number;
  onPanel: boolean; // panel ayakta arkadaki gizlilik paneli
  kabloDeligi: boolean;
  kulp: KulpKodu;
};

export const VARSAYILAN_MASA: MasaSecim = {
  genislik: 120,
  derinlik: 60,
  yukseklik: 74,
  ayak: "panel",
  metalRenk: "siyah",
  renk: "mese",
  cekmece: "yok",
  cekmeceSayi: 3,
  onPanel: true,
  kabloDeligi: true,
  kulp: "siyah",
};

export function masaDuzelt(girdi: unknown): MasaSecim {
  const g = (girdi ?? {}) as Partial<Record<keyof MasaSecim, unknown>>;
  const S = MASA_SINIRLARI;
  const V = VARSAYILAN_MASA;

  const genislik = sinirla(adimla(sayi(g.genislik, V.genislik), S.genislik.adim), S.genislik.min, S.genislik.max);
  const d = sayi(g.derinlik, V.derinlik);
  const derinlik = S.derinlikler.includes(d) ? d : V.derinlik;
  const y = sayi(g.yukseklik, V.yukseklik);
  const yukseklik = S.yukseklikler.includes(y) ? y : V.yukseklik;
  const ayak = AYAK_TURLERI.some((a) => a.kod === g.ayak) ? (g.ayak as AyakTuru) : V.ayak;
  const metalRenk = g.metalRenk === "beyaz" ? "beyaz" : "siyah";
  let cekmece: CekmeceYeri = g.cekmece === "sol" || g.cekmece === "sag" ? g.cekmece : "yok";
  if (genislik < S.cekmeceMinGenislik) cekmece = "yok";
  const cekmeceSayi = sinirla(Math.floor(sayi(g.cekmeceSayi, V.cekmeceSayi)), 1, S.maxCekmece);

  return {
    genislik,
    derinlik,
    yukseklik,
    ayak,
    metalRenk,
    renk: renkSec(g.renk, V.renk),
    cekmece,
    cekmeceSayi,
    onPanel: evetMi(g.onPanel, V.onPanel),
    kabloDeligi: evetMi(g.kabloDeligi, V.kabloDeligi),
    kulp: kulpSec(g.kulp),
  };
}

export function masaParcalari(s: MasaSecim): Parca[] {
  const W = s.genislik * 10;
  const D = s.derinlik * 10;
  const H = s.yukseklik * 10;
  const TT = TABLA_KALINLIK;
  const altH = H - TT; // tabla altına kadar yükseklik

  const p: Parca[] = [];
  const ekle = (x: Omit<Parca, "grup" | "malzeme"> & { malzeme?: Parca["malzeme"] }) =>
    p.push({ malzeme: "govde", grup: 0, ...x });

  ekle({ tur: "tabla", ad: "Tabla (25 mm)", en: W, boy: TT, derinlik: D, x: 0, y: H - TT / 2, z: 0, bantMm: 2 * (W + D), malzeme: "tabla" });

  if (s.kabloDeligi) {
    const x = s.cekmece === "sag" ? -W / 4 : s.cekmece === "sol" ? W / 4 : 0;
    ekle({ tur: "kabloDeligi", ad: "Kablo deliği kapağı", en: 60, boy: 2, derinlik: 60, x, y: H + 1, z: -D / 2 + 70, bantMm: 0, malzeme: "delik" });
  }

  // Ayaklar
  if (s.ayak === "panel") {
    const yanD = D - 40;
    for (const t of [-1, 1]) {
      ekle({ tur: "yan", ad: "Yan panel", en: T, boy: altH, derinlik: yanD, x: t * (W / 2 - T / 2), y: altH / 2, z: 0, bantMm: altH, dikey: true });
    }
    if (s.onPanel) {
      ekle({ tur: "onPanel", ad: "Arka gizlilik paneli", en: W - 2 * T, boy: 350, derinlik: T, x: 0, y: altH - 175, z: -yanD / 2 + 60, bantMm: W - 2 * T });
    }
  } else if (s.ayak === "metalU") {
    const icD = D - 80;
    for (const t of [-1, 1]) {
      const x = t * (W / 2 - 70);
      ekle({ tur: "metal", ad: "Ayak alt profili", en: PROFIL, boy: 20, derinlik: icD, x, y: 10, z: 0, bantMm: 0, malzeme: "metal" });
      ekle({ tur: "metal", ad: "Ayak üst profili", en: PROFIL, boy: 20, derinlik: icD, x, y: altH - 10, z: 0, bantMm: 0, malzeme: "metal" });
      for (const zt of [-1, 1]) {
        ekle({ tur: "metal", ad: "Ayak dikmesi", en: PROFIL, boy: altH - 40, derinlik: PROFIL, x, y: 20 + (altH - 40) / 2, z: zt * (icD / 2 - PROFIL / 2), bantMm: 0, malzeme: "metal" });
      }
    }
    ekle({ tur: "metal", ad: "Arka bağlantı profili", en: W - 140 - PROFIL, boy: 30, derinlik: 20, x: 0, y: altH - 15, z: -(D - 80) / 2 + 20, bantMm: 0, malzeme: "metal" });
  } else {
    const ax = W / 2 - 60;
    const az = D / 2 - 60;
    for (const xt of [-1, 1]) {
      for (const zt of [-1, 1]) {
        ekle({ tur: "metal", ad: "Kare ayak", en: PROFIL, boy: altH, derinlik: PROFIL, x: xt * ax, y: altH / 2, z: zt * az, bantMm: 0, malzeme: "metal" });
      }
    }
    for (const zt of [-1, 1]) {
      ekle({ tur: "metal", ad: "Çerçeve (uzun)", en: 2 * ax - PROFIL, boy: PROFIL, derinlik: 20, x: 0, y: altH - PROFIL / 2, z: zt * az, bantMm: 0, malzeme: "metal" });
    }
    for (const xt of [-1, 1]) {
      ekle({ tur: "metal", ad: "Çerçeve (kısa)", en: 20, boy: PROFIL, derinlik: 2 * az - PROFIL, x: xt * ax, y: altH - PROFIL / 2, z: 0, bantMm: 0, malzeme: "metal" });
    }
  }

  // Çekmece ünitesi: tablanın altında, yere basan kutu
  if (s.cekmece !== "yok") {
    const yon = s.cekmece === "sag" ? 1 : -1;
    const dis = s.ayak === "panel" ? W / 2 - T : W / 2 - 100;
    const ux = yon * (dis - UNITE_GENISLIK / 2);
    const UD = D - 80;
    const uz = D / 2 - 30 - UD / 2; // ön yüzü tablanın 3 cm gerisinde
    // Metal ayakta ünite, tablanın altındaki profilin altında kalır
    const UH = s.ayak === "panel" ? altH - 5 : altH - 45;
    const icW = UNITE_GENISLIK - 2 * T;

    for (const t of [-1, 1]) {
      ekle({ tur: "uniteYan", ad: "Çekmece ünitesi yanı", en: T, boy: UH, derinlik: UD, x: ux + t * (UNITE_GENISLIK / 2 - T / 2), y: UH / 2, z: uz, bantMm: UH, dikey: true });
    }
    ekle({ tur: "uniteUst", ad: "Çekmece ünitesi üstü", en: icW, boy: T, derinlik: UD, x: ux, y: UH - T / 2, z: uz, bantMm: icW });
    ekle({ tur: "uniteAlt", ad: "Çekmece ünitesi altı", en: icW, boy: T, derinlik: UD, x: ux, y: UNITE_BAZA + T / 2, z: uz, bantMm: icW });
    ekle({ tur: "uniteBaza", ad: "Çekmece ünitesi bazası", en: icW, boy: UNITE_BAZA, derinlik: T, x: ux, y: UNITE_BAZA / 2, z: uz + UD / 2 - T / 2 - 15, bantMm: icW });

    const n = s.cekmeceSayi;
    const onH = (UH - UNITE_BAZA) / n;
    const kutuD = UD - 50;
    const kutuW = icW - 26;
    for (let i = 0; i < n; i++) {
      const y = UNITE_BAZA + i * onH + onH / 2;
      ekle({ tur: "cekmeceOn", ad: "Çekmece ön", en: UNITE_GENISLIK - 3, boy: onH - 3, derinlik: T, x: ux, y, z: uz + UD / 2 + T / 2 + 1, bantMm: 2 * (UNITE_GENISLIK + onH), malzeme: "on" });
      if (s.kulp !== "yok") {
        ekle({ tur: "kulp", ad: "Kulp", en: 128, boy: 12, derinlik: 12, x: ux, y: Math.min(y + onH / 2 - 45, y + 40), z: uz + UD / 2 + T + 12, bantMm: 0, malzeme: "kulp" });
      }
      const kutuH = Math.max(60, onH - 50);
      for (const t of [-1, 1]) {
        ekle({ tur: "cekmeceGovde", ad: "Çekmece yanı", en: T, boy: kutuH, derinlik: kutuD, x: ux + t * (kutuW / 2 - T / 2), y, z: uz, bantMm: kutuD, gorunmez: true });
      }
      for (const yer of [-1, 1]) {
        ekle({ tur: "cekmeceGovde", ad: "Çekmece ön/arka iç", en: kutuW - 2 * T, boy: kutuH, derinlik: T, x: ux, y, z: uz + yer * (kutuD / 2 - T / 2), bantMm: kutuW - 2 * T, gorunmez: true });
      }
      ekle({ tur: "cekmeceTaban", ad: "Çekmece tabanı (HDF)", en: kutuW, boy: 3, derinlik: kutuD, x: ux, y: y - kutuH / 2, z: uz, bantMm: 0, gorunmez: true, malzeme: "arka" });
    }
  }

  return p;
}

export type MasaFiyat = { tablaM2: number; levhaM2: number; maliyet: number; fiyat: number };

export function masaFiyat(s: MasaSecim): MasaFiyat {
  const F = FIYATLAR;
  const parcalar = masaParcalari(s);
  const say = (t: string) => parcalar.filter((x) => x.tur === t).length;
  const desenli = RENKLER[s.renk].desenli;

  let tablaM2 = 0;
  let levhaM2 = 0;
  let hdfM2 = 0;
  let bantMm = 0;
  for (const x of parcalar) {
    if (x.malzeme === "metal" || x.malzeme === "kulp" || x.malzeme === "delik") continue;
    if (x.tur === "cekmeceTaban") {
      hdfM2 += m2(x.en, x.derinlik);
      continue;
    }
    if (x.tur === "tabla") tablaM2 += levhaAlani(x);
    else levhaM2 += levhaAlani(x);
    bantMm += x.bantMm;
  }

  const tablaBirim = desenli ? F.tablaDesenliM2 : F.tablaDuzM2;
  const malzeme =
    tablaM2 * (1 + F.fireOrani) * tablaBirim +
    levhaM2 * (1 + F.fireOrani) * levhaBirim(s.renk) +
    hdfM2 * (1 + F.fireOrani) * F.arkalikM2 +
    (bantMm / 1000) * 1.1 * F.bantM;

  const ayak = s.ayak === "metalU" ? F.metalAyakU : s.ayak === "metal4" ? F.metalAyak4 : 0;
  const cekmeceler = say("cekmeceOn");
  const kulpAdet = s.kulp === "yok" ? cekmeceler : say("kulp");
  const donanim =
    F.masaDonanim +
    ayak +
    cekmeceler * F.cekmeceRayi +
    kulpAdet * KULPLAR[s.kulp].fiyat +
    (s.kabloDeligi ? F.kabloDeligi : 0) +
    (s.cekmece !== "yok" ? F.donanimModul : 0);
  const iscilik = F.masaIscilik + (tablaM2 + levhaM2) * F.iscilikM2 + cekmeceler * F.iscilikCekmece;
  const ambalaj = F.masaAmbalaj + (tablaM2 + levhaM2) * F.ambalajM2;

  const maliyet = malzeme + donanim + iscilik + ambalaj;
  const yuv = (n: number) => Math.round(n * 100) / 100;
  return { tablaM2: yuv(tablaM2), levhaM2: yuv(levhaM2), maliyet: Math.round(maliyet), fiyat: satisFiyati(maliyet) };
}

// Sepette ve siparişte görünecek kısa açıklama
export function masaOzeti(s: MasaSecim) {
  const x = [
    `${s.genislik}×${s.derinlik}×${s.yukseklik} cm`,
    RENKLER[s.renk].ad,
    AYAK_TURLERI.find((a) => a.kod === s.ayak)!.ad + (s.ayak === "panel" ? "" : ` (${METAL_RENKLER[s.metalRenk].ad.toLocaleLowerCase("tr-TR")})`),
  ];
  if (s.cekmece !== "yok") x.push(`${s.cekmece === "sag" ? "sağda" : "solda"} ${s.cekmeceSayi} çekmeceli ünite`);
  if (s.ayak === "panel" && s.onPanel) x.push("gizlilik paneli");
  if (s.kabloDeligi) x.push("kablo deliği");
  return x.join(" · ");
}
