// Kendin Tasarla: ayakkabılık modeli.
// Klapalı (öne yatan kapaklar), kapaklı raflı veya açık raflı. İstenirse üstüne oturma minderi.
// Hem tarayıcıda hem sunucuda çalışır, ölçüler milimetre (mm).

import { FIYATLAR, KULPLAR, RENKLER, type KulpKodu, type RenkKodu } from "./fiyatlar";
import { adimla, evetMi, kulpSec, levhaAlani, levhaBirim, m2, renkSec, satisFiyati, sayi, sinirla, type Parca } from "./ortak";

export type AyakkabilikTipi = "klapali" | "kapakli" | "acik";
export type AyakkabilikAyak = "baza" | "metal";

export const AYAKKABILIK_TIPLERI: { kod: AyakkabilikTipi; ad: string; aciklama: string }[] = [
  { kod: "klapali", ad: "Klapalı", aciklama: "Öne yatan kapaklar, ince gövde" },
  { kod: "kapakli", ad: "Kapaklı", aciklama: "Menteşeli kapak, raflı" },
  { kod: "acik", ad: "Açık raf", aciklama: "Kapaksız" },
];

export const AYAKKABILIK_SINIRLARI = {
  genislik: { min: 50, max: 160, adim: 5 }, // cm
  yukseklik: { min: 40, max: 200, adim: 5 }, // cm
  derinlikler: [25, 30, 35, 40], // cm
  maxAciklik: 800, // mm: bundan geniş bölmeye ara dikme
  klapaYukseklik: 280, // mm: bir klapa sırasının yaklaşık yüksekliği
  rafAraligi: 170, // mm: ayakkabı için raf arası
  minderMaxYukseklik: 70, // cm: minder sadece oturulabilecek yükseklikte
};

const T = 18;
const A = 3;
const BOSLUK = 3;

export type AyakkabilikSecim = {
  genislik: number; // cm
  yukseklik: number; // cm (ayak dahil, minder hariç)
  derinlik: number; // cm
  tip: AyakkabilikTipi;
  renk: RenkKodu;
  kapakRenk: RenkKodu | "ayni";
  kulp: KulpKodu;
  ayak: AyakkabilikAyak;
  minder: boolean;
};

export const VARSAYILAN_AYAKKABILIK: AyakkabilikSecim = {
  genislik: 80,
  yukseklik: 110,
  derinlik: 30,
  tip: "klapali",
  renk: "beyaz",
  kapakRenk: "ayni",
  kulp: "siyah",
  ayak: "baza",
  minder: false,
};

export const ayakkabilikOnRengi = (s: AyakkabilikSecim) => (s.kapakRenk === "ayni" ? s.renk : s.kapakRenk);
const ayakYuk = (s: AyakkabilikSecim) => (s.ayak === "metal" ? 100 : 60);

export function ayakkabilikDuzelt(girdi: unknown): AyakkabilikSecim {
  const g = (girdi ?? {}) as Partial<Record<keyof AyakkabilikSecim, unknown>>;
  const S = AYAKKABILIK_SINIRLARI;
  const V = VARSAYILAN_AYAKKABILIK;
  const yukseklik = sinirla(adimla(sayi(g.yukseklik, V.yukseklik), S.yukseklik.adim), S.yukseklik.min, S.yukseklik.max);
  const d = sayi(g.derinlik, V.derinlik);
  const renk = renkSec(g.renk, V.renk);
  return {
    genislik: sinirla(adimla(sayi(g.genislik, V.genislik), S.genislik.adim), S.genislik.min, S.genislik.max),
    yukseklik,
    derinlik: S.derinlikler.includes(d) ? d : V.derinlik,
    tip: AYAKKABILIK_TIPLERI.some((t) => t.kod === g.tip) ? (g.tip as AyakkabilikTipi) : V.tip,
    renk,
    kapakRenk: g.kapakRenk === "ayni" || g.kapakRenk === undefined ? "ayni" : renkSec(g.kapakRenk, renk),
    kulp: kulpSec(g.kulp),
    ayak: g.ayak === "metal" ? "metal" : "baza",
    minder: yukseklik <= S.minderMaxYukseklik && evetMi(g.minder, V.minder),
  };
}

// Gövde ölçüleri ve bölme / sıra sayıları
export function ayakkabilikDuzeni(s: AyakkabilikSecim) {
  const S = AYAKKABILIK_SINIRLARI;
  const W = s.genislik * 10;
  const B = ayakYuk(s);
  const H = s.yukseklik * 10 - B; // gövde yüksekliği
  const icW = W - 2 * T;
  const bolme = Math.max(1, Math.ceil(icW / S.maxAciklik));
  const bolmeW = (icW - (bolme - 1) * T) / bolme;
  const icH = H - 2 * T;
  const sira = s.tip === "klapali" ? sinirla(Math.floor(icH / S.klapaYukseklik), 1, 6) : 0;
  const raf = s.tip === "klapali" ? 0 : Math.max(0, Math.floor((icH - S.rafAraligi) / (S.rafAraligi + T)));
  // Yaklaşık kapasite: bir çift ayakkabı ~20-22 cm genişlik kaplar
  const katBasi = Math.max(1, Math.floor(bolmeW / (s.tip === "klapali" ? 200 : 220)));
  const kat = s.tip === "klapali" ? sira : raf + 1;
  return { W, B, H, icW, icH, bolme, bolmeW, sira, raf, kapasite: katBasi * kat * bolme };
}

export function ayakkabilikParcalari(s: AyakkabilikSecim): Parca[] {
  const D = s.derinlik * 10;
  const { W, B, H, icW, icH, bolme, bolmeW, sira, raf } = ayakkabilikDuzeni(s);
  const gD = D - A;
  const gZ = A / 2;
  const onZ = gZ + gD / 2;
  const p: Parca[] = [];
  const ekle = (x: Omit<Parca, "grup" | "malzeme"> & { malzeme?: Parca["malzeme"] }) =>
    p.push({ malzeme: "govde", grup: 0, ...x });

  for (const t of [-1, 1]) {
    ekle({ tur: "yan", ad: "Yan panel", en: T, boy: H, derinlik: gD, x: t * (W / 2 - T / 2), y: B + H / 2, z: gZ, bantMm: H, dikey: true });
  }
  ekle({ tur: "ust", ad: "Üst tabla", en: W, boy: T, derinlik: D, x: 0, y: B + H + T / 2, z: 0, bantMm: W + 2 * D });
  ekle({ tur: "alt", ad: "Alt tabla", en: icW, boy: T, derinlik: gD, x: 0, y: B + T / 2, z: gZ, bantMm: icW });
  ekle({ tur: "arkalik", ad: "Arkalık (HDF)", en: W - 4, boy: H - 4, derinlik: A, x: 0, y: B + H / 2, z: -D / 2 + A / 2, bantMm: 0, malzeme: "arka", dikey: true });

  if (s.ayak === "baza") {
    ekle({ tur: "baza", ad: "Baza", en: icW, boy: B, derinlik: T, x: 0, y: B / 2, z: onZ - T / 2 - 20, bantMm: icW });
  } else {
    for (const xt of [-1, 1]) {
      for (const zt of [-1, 1]) {
        ekle({ tur: "metalAyak", ad: "Metal ayak", en: 30, boy: B, derinlik: 30, x: xt * (W / 2 - 40), y: B / 2, z: zt * (D / 2 - 40), bantMm: 0, malzeme: "metal", gosterim: true });
      }
    }
  }

  const icAlt = B + T;
  for (let i = 1; i < bolme; i++) {
    const x = -icW / 2 + i * bolmeW + (i - 1) * T + T / 2;
    ekle({ tur: "dikme", ad: "Ara dikme", en: T, boy: icH, derinlik: gD, x, y: icAlt + icH / 2, z: gZ, bantMm: icH, dikey: true });
  }
  const bolmeX = (b: number) => -icW / 2 + b * (bolmeW + T) + bolmeW / 2;

  if (s.tip === "klapali") {
    // Her bölmede alt alta klapalar. Ön yüzler gövdenin tamamını kaplar.
    const onH = (H - BOSLUK) / sira;
    const onW = (W - BOSLUK * bolme) / bolme;
    for (let b = 0; b < bolme; b++) {
      const x = -W / 2 + BOSLUK / 2 + onW / 2 + b * (onW + BOSLUK);
      for (let r = 0; r < sira; r++) {
        const y = B + BOSLUK / 2 + r * onH + onH / 2;
        ekle({ tur: "klapa", ad: "Klapa kapağı", en: onW, boy: onH - BOSLUK, derinlik: T, x, y, z: onZ + T / 2 + 1, bantMm: 2 * (onW + onH), malzeme: "on" });
        if (s.kulp !== "yok") {
          ekle({ tur: "kulp", ad: "Kulp", en: Math.min(128, onW * 0.35), boy: 12, derinlik: 12, x, y: y + onH / 2 - 40, z: onZ + T + 12, bantMm: 0, malzeme: "kulp" });
        }
        // İçteki eğimli ayakkabı rafı (görünmez, fiyat ve kesim listesi için)
        ekle({ tur: "klapaRafi", ad: "Klapa iç rafı", en: bolmeW - 4, boy: T, derinlik: Math.min(gD - 40, 220), x: bolmeX(b), y: y - onH / 4, z: gZ, bantMm: bolmeW, gorunmez: true });
      }
    }
  } else {
    const aralik = (icH - raf * T) / (raf + 1);
    for (let b = 0; b < bolme; b++) {
      for (let r = 1; r <= raf; r++) {
        const y = icAlt + r * aralik + (r - 1) * T + T / 2;
        ekle({ tur: "raf", ad: "Raf", en: bolmeW - 2, boy: T, derinlik: gD - 20, x: bolmeX(b), y, z: gZ - 10, bantMm: bolmeW - 2 });
      }
    }
    if (s.tip === "kapakli") {
      // Her bölmeye bir kapak; geniş bölmede çift kapak
      const parca = bolme * 1;
      const toplamOnW = (W - BOSLUK * parca) / parca;
      for (let b = 0; b < bolme; b++) {
        const bx = -W / 2 + BOSLUK / 2 + toplamOnW / 2 + b * (toplamOnW + BOSLUK);
        const adet = toplamOnW > 600 ? 2 : 1;
        const kW = (toplamOnW - (adet - 1) * BOSLUK) / adet;
        for (let i = 0; i < adet; i++) {
          const x = bx - toplamOnW / 2 + kW / 2 + i * (kW + BOSLUK);
          const kH = H - BOSLUK;
          ekle({ tur: "kapak", ad: "Kapak", en: kW, boy: kH, derinlik: T, x, y: B + H / 2, z: onZ + T / 2 + 1, bantMm: 2 * (kW + kH), malzeme: "on", dikey: true });
          if (s.kulp !== "yok") {
            // Tek kapaklı bölmelerde kulplar ortaya bakar (soldakiler sağda, sağdakiler solda)
            const sagda = adet === 1 ? b < bolme / 2 : i === 0;
            const kx = sagda ? x + kW / 2 - 40 : x - kW / 2 + 40;
            ekle({ tur: "kulp", ad: "Kulp", en: 12, boy: Math.min(128, kH * 0.25), derinlik: 12, x: kx, y: B + H - 120, z: onZ + T + 12, bantMm: 0, malzeme: "kulp" });
          }
        }
      }
    }
  }

  if (s.minder) {
    ekle({ tur: "minder", ad: "Oturma minderi", en: W - 10, boy: 50, derinlik: D - 10, x: 0, y: B + H + T + 25, z: 0, bantMm: 0, malzeme: "kumas" });
  }
  return p;
}

export function ayakkabilikFiyat(s: AyakkabilikSecim) {
  const F = FIYATLAR;
  const parcalar = ayakkabilikParcalari(s).filter((x) => !x.gosterim);
  const say = (t: string) => parcalar.filter((x) => x.tur === t).length;

  let govdeM2 = 0;
  let onM2 = 0;
  let hdfM2 = 0;
  let bantMm = 0;
  let mentese = 0;
  for (const x of parcalar) {
    if (x.malzeme === "kulp" || x.malzeme === "kumas") continue;
    if (x.malzeme === "arka") {
      hdfM2 += m2(x.en, x.boy);
      continue;
    }
    if (x.malzeme === "on") onM2 += levhaAlani(x);
    else govdeM2 += levhaAlani(x);
    bantMm += x.bantMm;
    if (x.tur === "kapak") mentese += x.boy <= 900 ? 2 : x.boy <= 1600 ? 3 : 4;
  }

  const levhaM2 = govdeM2 + onM2;
  const malzeme =
    govdeM2 * (1 + F.fireOrani) * levhaBirim(s.renk) +
    onM2 * (1 + F.fireOrani) * levhaBirim(ayakkabilikOnRengi(s)) +
    hdfM2 * (1 + F.fireOrani) * F.arkalikM2 +
    (bantMm / 1000) * 1.1 * F.bantM;

  const klapa = say("klapa");
  const kapak = say("kapak");
  const kulpAdet = s.kulp === "yok" ? klapa + kapak : say("kulp");
  const donanim =
    F.donanimModul +
    say("raf") * F.donanimRaf +
    mentese * F.mentese +
    klapa * F.klapaMekanizma +
    kulpAdet * KULPLAR[s.kulp].fiyat +
    (s.ayak === "metal" ? F.metalAyakTakimi : 0);
  const minder = s.minder ? (s.genislik / 100) * F.minderM : 0;
  const iscilik = F.iscilikSabit + F.iscilikModul + levhaM2 * F.iscilikM2 + (klapa + kapak) * F.iscilikKapak;
  const ambalaj = F.ambalajModul + (levhaM2 + hdfM2) * F.ambalajM2;

  const maliyet = malzeme + donanim + minder + iscilik + ambalaj;
  return { maliyet: Math.round(maliyet), fiyat: satisFiyati(maliyet) };
}

export function ayakkabilikOzeti(s: AyakkabilikSecim) {
  const d = ayakkabilikDuzeni(s);
  const x = [
    `${s.genislik}×${s.yukseklik}×${s.derinlik} cm`,
    AYAKKABILIK_TIPLERI.find((t) => t.kod === s.tip)!.ad + (s.tip === "klapali" ? ` (${d.sira * d.bolme} klapa)` : ""),
    RENKLER[s.renk].ad,
  ];
  if (s.kapakRenk !== "ayni" && s.tip !== "acik") x.push(`kapak ${RENKLER[s.kapakRenk].ad}`);
  if (s.tip !== "acik") x.push(s.kulp === "yok" ? "kulpsuz" : `${KULPLAR[s.kulp].ad.toLocaleLowerCase("tr-TR")} kulp`);
  x.push(s.ayak === "metal" ? "metal ayak" : "bazalı");
  if (s.minder) x.push("oturma minderi");
  return x.join(" · ");
}
