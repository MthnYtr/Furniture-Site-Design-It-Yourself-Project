// Kendin Tasarla: mutfak ve banyo dolabı modeli.
// Duvar boyunca iki ayrı sıra var: alt dolaplar ve üst dolaplar. İkisi birbirinden bağımsız eklenir.
// Düz mutfakta tek duvar, L mutfakta iki duvar (ana + yan) ve köşede bir köşe modülü vardır.
// Sıralar köşeden (düzde sol uçtan) başlar. Üst dolaplar boy dolabın önüne gelmez, otomatik yanına kayar.
// Hem tarayıcıda hem sunucuda çalışır, ölçüler milimetre (mm).
// Koordinatlar: duvar z = 0 düzleminde, dolaplar duvardan öne (+z) doğru uzanır.

import {
  FIYATLAR,
  KULPLAR,
  RENKLER,
  TEZGAH_RENKLERI,
  type KulpKodu,
  type RenkKodu,
  type TezgahKodu,
} from "./fiyatlar";
import { adimla, kulpSec, levhaAlani, levhaBirim, m2, renkSec, satisFiyati, sayi, sinirla, type Parca } from "./ortak";

export type DolapTuru = "mutfak" | "banyo";
export type AltTur = "kapak" | "cekmece" | "evye" | "ocak" | "bosluk" | "boy" | "lavabo" | "acik";
export type UstTur = "kapak" | "cam" | "acik" | "ayna" | "bosluk";
export type Sira = "alt" | "ust";
export type Duvar = "ana" | "yan";
export type Sekil = "duz" | "L";
export type KoseYonu = "sol" | "sag";
export type KoseTuru = "unite" | "kor";

export const KOSE_TURLERI: { kod: KoseTuru; ad: string; aciklama: string }[] = [
  { kod: "unite", ad: "Köşe ünitesi", aciklama: "90×90 cm, iki kapaklı, köşe tam kullanılır" },
  { kod: "kor", ad: "Kör köşe", aciklama: "100 cm dolap, köşenin bir kısmı kör kalır, daha ekonomik" },
];

type Secenek<T> = { kod: T; ad: string; aciklama: string; minGenislik?: number };

export const ALT_SECENEKLERI: Record<DolapTuru, Secenek<AltTur>[]> = {
  mutfak: [
    { kod: "kapak", ad: "Kapaklı", aciklama: "İçinde 1 raf" },
    { kod: "cekmece", ad: "Çekmeceli", aciklama: "3 çekmece" },
    { kod: "evye", ad: "Evye dolabı", aciklama: "Tezgaha evye kesimi", minGenislik: 60 },
    { kod: "ocak", ad: "Ocak altı", aciklama: "Ocak kesimi + çekmece", minGenislik: 60 },
    { kod: "bosluk", ad: "Beyaz eşya", aciklama: "Bulaşık makinesi boşluğu", minGenislik: 45 },
    { kod: "boy", ad: "Boy dolap", aciklama: "Tavana kadar, 5 raf" },
  ],
  banyo: [
    { kod: "lavabo", ad: "Lavabolu", aciklama: "Seramik lavabo dahil", minGenislik: 50 },
    { kod: "kapak", ad: "Kapaklı", aciklama: "İçinde 1 raf" },
    { kod: "cekmece", ad: "Çekmeceli", aciklama: "2 çekmece" },
    { kod: "acik", ad: "Açık raf", aciklama: "Havlu, sepet için" },
    { kod: "boy", ad: "Boy dolap", aciklama: "Uzun dolap, 4 raf" },
  ],
};

export const UST_SECENEKLERI: Record<DolapTuru, Secenek<UstTur>[]> = {
  mutfak: [
    { kod: "kapak", ad: "Kapaklı", aciklama: "İçinde 1 raf" },
    { kod: "cam", ad: "Cam kapak", aciklama: "Vitrin" },
    { kod: "acik", ad: "Açık raf", aciklama: "Kapaksız" },
    { kod: "bosluk", ad: "Boş duvar", aciklama: "Davlumbaz, pencere" },
  ],
  banyo: [
    { kod: "ayna", ad: "Aynalı dolap", aciklama: "Ayna kapak, 2 raf" },
    { kod: "kapak", ad: "Kapaklı", aciklama: "Düz kapak" },
    { kod: "acik", ad: "Açık raf", aciklama: "Kapaksız" },
    { kod: "bosluk", ad: "Boş duvar", aciklama: "Ara boşluk" },
  ],
};

// Ölçüler (mm). Piyasa standartları: mutfak alt dolap 72 cm gövde + 10 cm baza + 3,8 cm tezgah ≈ 86 cm.
export const DOLAP_OLCULERI = {
  mutfak: {
    baza: 100,
    altH: 720,
    altD: 560,
    tezgahK: 38,
    tezgahD: 620,
    ustY0: 1450, // üst dolabın alt kenarı yerden
    ustH: 720,
    ustD: 330,
    boyH: 2070, // baza üstünden
    cekmece: 3,
    genislik: { min: 30, max: 100, adim: 5 },
  },
  banyo: {
    asmaY0: 300, // asma dolabın alt kenarı yerden
    baza: 150, // ayaklı modelde
    altH: 500,
    altD: 460,
    tezgahK: 0,
    tezgahD: 0,
    ustY0: 1150,
    ustH: 700,
    ustD: 150,
    boyH: 1500,
    cekmece: 2,
    genislik: { min: 30, max: 100, adim: 5 },
  },
};

export const MAX_MODUL = 8; // her sırada
const T = 18;
const A = 3; // HDF arkalık
const BOSLUK = 3; // kapak arası
const CIFT_KAPAK = 600; // mm: bundan geniş modüllerde çift kapak
const LAVABO_YUK = 160; // mm seramik lavabonun yüksekliği
// 3D'de tıklanınca hangi dolabın seçileceği grup numarasından anlaşılır
export const GRUP = { anaAlt: 0, anaUst: 100, yanAlt: 200, yanUst: 300, kose: 400 };
// Köşe modülünün duvarlar boyunca kapladığı uzunluk (mm)
const KOSE_OLCU = { unite: { ana: 900, yan: 900 }, kor: { ana: 1000, yan: 580 } };
const KOSE_UST = 600; // köşe üst dolabı (L) her iki duvarda 60 cm
export type AltModul = { genislik: number; tur: AltTur };
export type UstModul = { genislik: number; tur: UstTur };

export type DolapSecim = {
  tur: DolapTuru;
  renk: RenkKodu;
  kapakRenk: RenkKodu | "ayni";
  tezgah: TezgahKodu;
  kulp: KulpKodu;
  asma: boolean; // banyo: duvara asma (true) ya da ayaklı
  sekil: Sekil; // mutfak: düz ya da L
  kose: KoseYonu; // L'de köşe hangi uçta
  koseTur: KoseTuru;
  koseUst: boolean; // köşeye üst dolap
  altlar: AltModul[]; // ana duvar
  ustler: UstModul[];
  yanAltlar: AltModul[]; // L'de yan duvar (köşeden dışarı doğru)
  yanUstler: UstModul[];
};

export const VARSAYILAN_DOLAP: Record<DolapTuru, DolapSecim> = {
  mutfak: {
    tur: "mutfak",
    renk: "beyaz",
    kapakRenk: "ayni",
    tezgah: "mermer",
    kulp: "siyah",
    asma: false,
    sekil: "duz",
    kose: "sol",
    koseTur: "unite",
    koseUst: true,
    altlar: [
      { genislik: 60, tur: "cekmece" },
      { genislik: 80, tur: "evye" },
      { genislik: 60, tur: "bosluk" },
      { genislik: 60, tur: "ocak" },
      { genislik: 40, tur: "kapak" },
    ],
    ustler: [
      { genislik: 60, tur: "kapak" },
      { genislik: 80, tur: "kapak" },
      { genislik: 60, tur: "kapak" },
      { genislik: 60, tur: "bosluk" },
      { genislik: 40, tur: "cam" },
    ],
    yanAltlar: [
      { genislik: 60, tur: "kapak" },
      { genislik: 60, tur: "cekmece" },
    ],
    yanUstler: [
      { genislik: 60, tur: "kapak" },
      { genislik: 60, tur: "kapak" },
    ],
  },
  banyo: {
    tur: "banyo",
    renk: "beyaz",
    kapakRenk: "ayni",
    tezgah: "mermer",
    kulp: "krom",
    asma: true,
    sekil: "duz",
    kose: "sol",
    koseTur: "unite",
    koseUst: false,
    altlar: [
      { genislik: 80, tur: "lavabo" },
      { genislik: 35, tur: "boy" },
    ],
    ustler: [{ genislik: 80, tur: "ayna" }],
    yanAltlar: [],
    yanUstler: [],
  },
};

export const dolapOnRengi = (s: DolapSecim): RenkKodu => (s.kapakRenk === "ayni" ? s.renk : s.kapakRenk);
export const lMi = (s: DolapSecim) => s.tur === "mutfak" && s.sekil === "L";

function genislikDuzelt(v: unknown, tur: DolapTuru, min = 0) {
  const G = DOLAP_OLCULERI[tur].genislik;
  return sinirla(adimla(sayi(v, 60), G.adim), Math.max(G.min, min), G.max);
}

function altDuzelt(girdi: unknown, tur: DolapTuru): AltModul {
  const g = (girdi ?? {}) as Partial<Record<keyof AltModul, unknown>>;
  const sec = ALT_SECENEKLERI[tur].find((x) => x.kod === g.tur) ?? ALT_SECENEKLERI[tur][0];
  return { genislik: genislikDuzelt(g.genislik, tur, sec.minGenislik), tur: sec.kod };
}

function ustDuzelt(girdi: unknown, tur: DolapTuru): UstModul {
  const g = (girdi ?? {}) as Partial<Record<keyof UstModul, unknown>>;
  const sec = UST_SECENEKLERI[tur].find((x) => x.kod === g.tur) ?? UST_SECENEKLERI[tur][0];
  return { genislik: genislikDuzelt(g.genislik, tur), tur: sec.kod };
}

export function dolapDuzelt(girdi: unknown, turZorla?: DolapTuru): DolapSecim {
  const g = (girdi ?? {}) as Partial<Record<keyof DolapSecim, unknown>>;
  const tur: DolapTuru = turZorla ?? (g.tur === "banyo" ? "banyo" : "mutfak");
  const V = VARSAYILAN_DOLAP[tur];
  const renk = renkSec(g.renk, V.renk);
  const liste = (v: unknown, yedek: unknown[], bosOlur: boolean) =>
    Array.isArray(v) && (bosOlur || v.length > 0) ? v : yedek;
  const sekil: Sekil = tur === "mutfak" && g.sekil === "L" ? "L" : "duz";
  return {
    tur,
    renk,
    kapakRenk: g.kapakRenk === "ayni" || g.kapakRenk === undefined ? "ayni" : renkSec(g.kapakRenk, renk),
    tezgah: (Object.keys(TEZGAH_RENKLERI) as TezgahKodu[]).includes(g.tezgah as TezgahKodu) ? (g.tezgah as TezgahKodu) : V.tezgah,
    kulp: g.kulp === undefined ? V.kulp : kulpSec(g.kulp),
    asma: g.asma === undefined ? V.asma : g.asma === true,
    sekil,
    kose: g.kose === "sag" ? "sag" : "sol",
    koseTur: g.koseTur === "kor" ? "kor" : "unite",
    koseUst: g.koseUst === undefined ? V.koseUst : g.koseUst === true,
    altlar: liste(g.altlar, V.altlar, false).slice(0, MAX_MODUL).map((m) => altDuzelt(m, tur)),
    // Üst sıralar ve yan duvar alt sırası boş bırakılabilir
    ustler: liste(g.ustler, V.ustler, true).slice(0, MAX_MODUL).map((m) => ustDuzelt(m, tur)),
    yanAltlar: tur === "mutfak" ? liste(g.yanAltlar, V.yanAltlar, true).slice(0, MAX_MODUL).map((m) => altDuzelt(m, tur)) : [],
    yanUstler: tur === "mutfak" ? liste(g.yanUstler, V.yanUstler, true).slice(0, MAX_MODUL).map((m) => ustDuzelt(m, tur)) : [],
  };
}

// Alt dolapların yerden başladığı yükseklik
function altY0(s: DolapSecim) {
  return s.tur === "mutfak" ? DOLAP_OLCULERI.mutfak.baza : s.asma ? DOLAP_OLCULERI.banyo.asmaY0 : DOLAP_OLCULERI.banyo.baza;
}

function altTepe(s: DolapSecim, m: AltModul) {
  const O = DOLAP_OLCULERI[s.tur];
  if (m.tur === "boy") return altY0(s) + O.boyH;
  return altY0(s) + O.altH + O.tezgahK + (m.tur === "lavabo" ? LAVABO_YUK : 0);
}

// Bir duvar boyunca sıra yerleşimi (köşeden uzaklık, mm). Üst dolaplar boy dolabın önüne gelmez.
function siraYerlesimi(s: DolapSecim, altlar: AltModul[], ustler: UstModul[], altBas: number, ustBas: number) {
  let x = altBas;
  const alt = altlar.map((m) => {
    const k = { x0: x, w: m.genislik * 10 };
    x += k.w;
    return k;
  });
  const boylar = alt.filter((_, i) => altlar[i].tur === "boy");
  let c = ustBas;
  const ust = ustler.map((m) => {
    const w = m.genislik * 10;
    let degisti = true;
    while (degisti) {
      degisti = false;
      for (const b of boylar) {
        if (c < b.x0 + b.w && c + w > b.x0) {
          c = b.x0 + b.w;
          degisti = true;
        }
      }
    }
    const k = { x0: c, w };
    c += w;
    return k;
  });
  return { alt, ust, son: Math.max(x, c, altBas) };
}

function koseOlcu(s: DolapSecim) {
  return lMi(s) ? KOSE_OLCU[s.koseTur] : { ana: 0, yan: 0 };
}

// Dünya koordinatında bir kutu (seçim çerçevesi için). x, z merkez; sx, sz genişlik; alt, tepe yükseklik.
export type Kutu = { x: number; z: number; sx: number; sz: number; alt: number; tepe: number };

export type Yerlesim = {
  anaAlt: Kutu[];
  anaUst: Kutu[];
  yanAlt: Kutu[];
  yanUst: Kutu[];
  kose: Kutu | null;
  anaUzunluk: number; // mm, köşe dahil
  yanUzunluk: number;
};

export function dolapYerlesim(s: DolapSecim): Yerlesim {
  const O = DOLAP_OLCULERI[s.tur];
  const L = lMi(s);
  const K = koseOlcu(s);
  const ustBas = L ? (s.koseUst ? KOSE_UST : O.ustD) : 0;
  const ana = siraYerlesimi(s, s.altlar, s.ustler, K.ana, ustBas);
  const yan = L ? siraYerlesimi(s, s.yanAltlar, s.yanUstler, K.yan, ustBas) : { alt: [], ust: [], son: 0 };
  const ayna = L && s.kose === "sag" ? -1 : 1; // sağ köşede her şey x ekseninde aynalanır

  const anaKutu = (k: { x0: number; w: number }, D: number, alt: number, tepe: number): Kutu => ({
    x: ayna * (k.x0 + k.w / 2),
    z: D / 2,
    sx: k.w,
    sz: D,
    alt,
    tepe,
  });
  const yanKutu = (k: { x0: number; w: number }, D: number, alt: number, tepe: number): Kutu => ({
    x: ayna * (D / 2),
    z: k.x0 + k.w / 2,
    sx: D,
    sz: k.w,
    alt,
    tepe,
  });
  const ustAlt = O.ustY0;
  const ustTepe = O.ustY0 + O.ustH;
  const tezgahUst = altY0(s) + O.altH + O.tezgahK;

  return {
    anaAlt: ana.alt.map((k, i) => anaKutu(k, O.altD, 0, altTepe(s, s.altlar[i]))),
    anaUst: ana.ust.map((k) => anaKutu(k, O.ustD, ustAlt, ustTepe)),
    yanAlt: yan.alt.map((k, i) => yanKutu(k, O.altD, 0, altTepe(s, s.yanAltlar[i]))),
    yanUst: yan.ust.map((k) => yanKutu(k, O.ustD, ustAlt, ustTepe)),
    kose: L
      ? {
          x: ayna * (K.ana / 2),
          z: Math.max(K.yan, O.altD) / 2,
          sx: K.ana,
          sz: Math.max(K.yan, O.altD),
          alt: 0,
          tepe: s.koseUst ? ustTepe : tezgahUst,
        }
      : null,
    anaUzunluk: ana.son,
    yanUzunluk: yan.son,
  };
}

// Ölçü yazısı: "300 cm" ya da "300 + 240 cm"
export function dolapOlcuMetni(s: DolapSecim) {
  const Y = dolapYerlesim(s);
  const a = Math.round(Y.anaUzunluk / 10);
  return lMi(s) ? `${a} + ${Math.round(Y.yanUzunluk / 10)} cm (L)` : `${a} cm`;
}

// Ürünün en yüksek noktası (mm)
export function dolapYukseklik(s: DolapSecim) {
  const Y = dolapYerlesim(s);
  const ustler = [
    ...Y.anaUst.filter((_, i) => s.ustler[i].tur !== "bosluk"),
    ...Y.yanUst.filter((_, i) => s.yanUstler[i].tur !== "bosluk"),
  ];
  return Math.max(...Y.anaAlt.map((k) => k.tepe), ...Y.yanAlt.map((k) => k.tepe), ...ustler.map((k) => k.tepe), Y.kose?.tepe ?? 0);
}

type Ekle = (p: Omit<Parca, "grup" | "malzeme"> & { malzeme?: Parca["malzeme"] }) => void;

// Dolap gövdesi: 2 yan, alt, üst tabla ve arkalık. Ön yüzün z konumunu döner.
function govde(ekle: Ekle, x: number, y0: number, W: number, H: number, D: number, adPrefix: string) {
  const icW = W - 2 * T;
  const gD = D - A;
  const gZ = A + gD / 2;
  for (const t of [-1, 1]) {
    ekle({ tur: "yan", ad: `${adPrefix} yan panel`, en: T, boy: H, derinlik: gD, x: x + t * (W / 2 - T / 2), y: y0 + H / 2, z: gZ, bantMm: H, dikey: true });
  }
  ekle({ tur: "alt", ad: `${adPrefix} alt tabla`, en: icW, boy: T, derinlik: gD, x, y: y0 + T / 2, z: gZ, bantMm: icW });
  ekle({ tur: "ust", ad: `${adPrefix} üst tabla`, en: icW, boy: T, derinlik: gD, x, y: y0 + H - T / 2, z: gZ, bantMm: icW });
  ekle({ tur: "arkalik", ad: `${adPrefix} arkalık (HDF)`, en: W - 4, boy: H - 4, derinlik: A, x, y: y0 + H / 2, z: A / 2, bantMm: 0, malzeme: "arka", dikey: true });
  return { onZ: D, icW, gD, gZ };
}

function raflar(ekle: Ekle, x: number, y0: number, H: number, icW: number, gD: number, gZ: number, adet: number) {
  const icH = H - 2 * T;
  const aralik = (icH - adet * T) / (adet + 1);
  for (let r = 1; r <= adet; r++) {
    const y = y0 + T + r * aralik + (r - 1) * T + T / 2;
    ekle({ tur: "raf", ad: "Raf", en: icW - 2, boy: T, derinlik: gD - 20, x, y, z: gZ - 10, bantMm: icW - 2 });
  }
}

type KapakTipi = "duz" | "cam" | "ayna";

// Kapak(lar): verilen yükseklik aralığını kaplar. kulpYeri: kulp kapağın üstüne mi altına mı yakın.
function kapaklar(
  ekle: Ekle,
  s: DolapSecim,
  x: number,
  W: number,
  yAlt: number,
  yUst: number,
  z: number,
  tip: KapakTipi,
  kulpYeri: "ust" | "alt" | "orta",
) {
  const adet = W > CIFT_KAPAK ? 2 : 1;
  const kW = (W - BOSLUK * adet) / adet;
  const kH = yUst - yAlt - BOSLUK;
  const kY = yAlt + BOSLUK / 2 + kH / 2;
  const kz = z + T / 2 + 1;
  const kulpH = Math.min(128, kH * 0.3);
  const kulpY = kulpYeri === "ust" ? kY + kH / 2 - 40 - kulpH / 2 : kulpYeri === "alt" ? kY - kH / 2 + 40 + kulpH / 2 : kY;
  for (let i = 0; i < adet; i++) {
    const kx = x - W / 2 + BOSLUK / 2 + kW / 2 + i * (kW + BOSLUK);
    if (tip === "cam") {
      ekle({ tur: "camCerceve", ad: "Cam kapak çerçevesi (alüminyum)", en: kW, boy: kH, derinlik: T, x: kx, y: kY, z: kz, bantMm: 0, malzeme: "cerceve" });
      ekle({ tur: "cam", ad: "Cam (4 mm)", en: kW - 44, boy: kH - 44, derinlik: 4, x: kx, y: kY, z: kz + 2, bantMm: 0, malzeme: "cam" });
    } else {
      ekle({ tur: "kapak", ad: "Kapak", en: kW, boy: kH, derinlik: T, x: kx, y: kY, z: kz, bantMm: 2 * (kW + kH), malzeme: "on", dikey: true });
      if (tip === "ayna") {
        ekle({ tur: "ayna", ad: "Ayna (4 mm)", en: kW - 30, boy: kH - 30, derinlik: 4, x: kx, y: kY, z: kz + T / 2 + 2, bantMm: 0, malzeme: "ayna" });
      }
    }
    if (s.kulp !== "yok" && tip !== "ayna") {
      const kulpX = adet === 1 ? kx + kW / 2 - 40 : i === 0 ? kx + kW / 2 - 40 : kx - kW / 2 + 40;
      ekle({ tur: "kulp", ad: "Kulp", en: 12, boy: kulpH, derinlik: 12, x: kulpX, y: kulpY, z: kz + T / 2 + 12, bantMm: 0, malzeme: "kulp" });
    }
  }
}

function cekmeceler(ekle: Ekle, s: DolapSecim, x: number, W: number, yAlt: number, yUst: number, z: number, icW: number, gD: number, gZ: number, n: number) {
  const onH = (yUst - yAlt) / n;
  const kutuD = gD - 50;
  const kutuW = icW - 26;
  for (let i = 0; i < n; i++) {
    const y = yAlt + i * onH + onH / 2;
    ekle({ tur: "cekmeceOn", ad: "Çekmece ön", en: W - BOSLUK, boy: onH - BOSLUK, derinlik: T, x, y, z: z + T / 2 + 1, bantMm: 2 * (W + onH), malzeme: "on" });
    if (s.kulp !== "yok") {
      ekle({ tur: "kulp", ad: "Kulp", en: Math.min(160, W * 0.4), boy: 12, derinlik: 12, x, y: y + onH / 2 - 40, z: z + T + 12, bantMm: 0, malzeme: "kulp" });
    }
    const kutuH = Math.max(60, onH - 50);
    for (const t of [-1, 1]) {
      ekle({ tur: "cekmeceGovde", ad: "Çekmece yanı", en: T, boy: kutuH, derinlik: kutuD, x: x + t * (kutuW / 2 - T / 2), y, z: gZ, bantMm: kutuD, gorunmez: true });
    }
    for (const yer of [-1, 1]) {
      ekle({ tur: "cekmeceGovde", ad: "Çekmece ön/arka iç", en: kutuW - 2 * T, boy: kutuH, derinlik: T, x, y, z: gZ + yer * (kutuD / 2 - T / 2), bantMm: kutuW - 2 * T, gorunmez: true });
    }
    ekle({ tur: "cekmeceTaban", ad: "Çekmece tabanı (HDF)", en: kutuW, boy: 3, derinlik: kutuD, x, y: y - kutuH / 2, z: gZ, bantMm: 0, gorunmez: true, malzeme: "arka" });
  }
}

function altParcalari(s: DolapSecim, m: AltModul, no: number, x: number): Parca[] {
  const O = DOLAP_OLCULERI[s.tur];
  const p: Parca[] = [];
  const ekle: Ekle = (q) => p.push({ malzeme: "govde", ...q, grup: no });
  const W = m.genislik * 10;
  const y0 = altY0(s);
  const bazaVar = s.tur === "mutfak" || !s.asma;

  if (m.tur === "bosluk") {
    // Beyaz eşya: sadece görünüm, dolap yok
    const h = y0 + O.altH - 5;
    ekle({ tur: "beyazEsya", ad: "Beyaz eşya", en: W - 6, boy: h, derinlik: 20, x, y: h / 2, z: O.altD - 10, bantMm: 0, malzeme: "celik", gosterim: true });
    ekle({ tur: "beyazEsya", ad: "Beyaz eşya paneli", en: W - 6, boy: 70, derinlik: 22, x, y: h - 35, z: O.altD - 9, bantMm: 0, malzeme: "camSiyah", gosterim: true });
    ekle({ tur: "beyazEsya", ad: "Beyaz eşya kolu", en: W * 0.6, boy: 14, derinlik: 14, x, y: h - 100, z: O.altD + 8, bantMm: 0, malzeme: "kulp", gosterim: true });
    return p;
  }

  const H = m.tur === "boy" ? O.boyH : O.altH;
  const g = govde(ekle, x, y0, W, H, O.altD, m.tur === "boy" ? "Boy dolap" : "Alt dolap");
  if (bazaVar) {
    ekle({ tur: "baza", ad: "Baza", en: W, boy: y0, derinlik: T, x, y: y0 / 2, z: O.altD - 50, bantMm: W });
  }
  const yU = y0 + H;
  switch (m.tur) {
    case "kapak":
      raflar(ekle, x, y0, H, g.icW, g.gD, g.gZ, 1);
      kapaklar(ekle, s, x, W, y0, yU, g.onZ, "duz", "ust");
      break;
    case "acik":
      raflar(ekle, x, y0, H, g.icW, g.gD, g.gZ, 1);
      break;
    case "cekmece":
      cekmeceler(ekle, s, x, W, y0, yU, g.onZ, g.icW, g.gD, g.gZ, O.cekmece);
      break;
    case "ocak":
      cekmeceler(ekle, s, x, W, y0, yU, g.onZ, g.icW, g.gD, g.gZ, 2);
      break;
    case "evye":
    case "lavabo":
      kapaklar(ekle, s, x, W, y0, yU, g.onZ, "duz", "ust");
      break;
    case "boy": {
      raflar(ekle, x, y0, H, g.icW, g.gD, g.gZ, s.tur === "mutfak" ? 5 : 4);
      // Mutfakta alt kapak tezgah hizasında biter, üstte ikinci kapak
      const bolum = s.tur === "mutfak" ? y0 + O.altH : y0 + H * 0.55;
      kapaklar(ekle, s, x, W, y0, bolum, g.onZ, "duz", "ust");
      kapaklar(ekle, s, x, W, bolum, yU, g.onZ, "duz", "alt");
      break;
    }
  }

  const tezgahUst = y0 + O.altH + O.tezgahK;

  // Evye, ocak, lavabo görünümü
  if (m.tur === "evye") {
    const ew = Math.min(W - 120, 760);
    const ez = O.tezgahD / 2 + 10;
    ekle({ tur: "evye", ad: "Evye", en: ew, boy: 4, derinlik: 440, x, y: tezgahUst + 2, z: ez, bantMm: 0, malzeme: "celik", gosterim: true });
    ekle({ tur: "evye", ad: "Evye çukuru", en: ew - 60, boy: 2, derinlik: 380, x, y: tezgahUst + 4.5, z: ez, bantMm: 0, malzeme: "ocakGoz", gosterim: true });
    ekle({ tur: "batarya", ad: "Batarya", en: 30, boy: 280, derinlik: 30, x, y: tezgahUst + 140, z: 70, bantMm: 0, malzeme: "celik", gosterim: true });
    ekle({ tur: "batarya", ad: "Batarya ağzı", en: 26, boy: 26, derinlik: 180, x, y: tezgahUst + 270, z: 150, bantMm: 0, malzeme: "celik", gosterim: true });
  }
  if (m.tur === "ocak") {
    const ow = Math.min(W - 60, 580);
    const oz = O.tezgahD / 2 + 10;
    ekle({ tur: "ocak", ad: "Ocak", en: ow, boy: 6, derinlik: 510, x, y: tezgahUst + 3, z: oz, bantMm: 0, malzeme: "camSiyah", gosterim: true });
    for (const [dx, dz, r] of [[-1, -1, 90], [1, -1, 70], [-1, 1, 70], [1, 1, 90]] as const) {
      ekle({ tur: "ocakGozu", ad: "Ocak gözü", en: r * 2, boy: 2, derinlik: r * 2, x: x + dx * ow * 0.24, y: tezgahUst + 7, z: oz + dz * 125, bantMm: 0, malzeme: "ocakGoz", gosterim: true, silindir: true });
    }
  }
  if (m.tur === "lavabo") {
    const ust = y0 + O.altH;
    ekle({ tur: "lavabo", ad: "Seramik lavabo", en: W + 10, boy: LAVABO_YUK, derinlik: O.altD + 20, x, y: ust + LAVABO_YUK / 2, z: (O.altD + 20) / 2, bantMm: 0, malzeme: "seramik", gosterim: true });
    ekle({ tur: "lavabo", ad: "Lavabo çanağı", en: W - 140, boy: 2, derinlik: O.altD - 160, x, y: ust + LAVABO_YUK + 1, z: O.altD / 2 + 40, bantMm: 0, malzeme: "celik", gosterim: true });
    ekle({ tur: "batarya", ad: "Batarya", en: 30, boy: 200, derinlik: 30, x, y: ust + LAVABO_YUK + 100, z: 60, bantMm: 0, malzeme: "celik", gosterim: true });
    ekle({ tur: "batarya", ad: "Batarya ağzı", en: 26, boy: 26, derinlik: 130, x, y: ust + LAVABO_YUK + 190, z: 115, bantMm: 0, malzeme: "celik", gosterim: true });
  }
  return p;
}

function ustParcalari(s: DolapSecim, m: UstModul, no: number, x: number): Parca[] {
  if (m.tur === "bosluk") return [];
  const O = DOLAP_OLCULERI[s.tur];
  const p: Parca[] = [];
  const ekle: Ekle = (q) => p.push({ malzeme: "govde", ...q, grup: no });
  const W = m.genislik * 10;
  const g = govde(ekle, x, O.ustY0, W, O.ustH, O.ustD, "Üst dolap");
  const yU = O.ustY0 + O.ustH;
  raflar(ekle, x, O.ustY0, O.ustH, g.icW, g.gD, g.gZ, m.tur === "ayna" ? 2 : 1);
  if (m.tur === "kapak") kapaklar(ekle, s, x, W, O.ustY0, yU, g.onZ, "duz", "alt");
  if (m.tur === "cam") kapaklar(ekle, s, x, W, O.ustY0, yU, g.onZ, "cam", "alt");
  if (m.tur === "ayna") kapaklar(ekle, s, x, W, O.ustY0, yU, g.onZ, "ayna", "alt");
  return p;
}


// Yan duvardaki parçalar: sıranın yerel koordinatından (x: köşeden uzaklık, z: duvardan derinlik)
// dünyaya çevrilir. Yan duvar x = 0 düzleminde, dolaplar +x yönüne bakar.
function yanaCevir(p: Parca): Parca {
  return { ...p, x: p.z, z: p.x, en: p.derinlik, derinlik: p.en };
}

// Köşe modülü (sol köşe için, dünya koordinatında)
function koseParcalari(s: DolapSecim): Parca[] {
  const O = DOLAP_OLCULERI[s.tur];
  const p: Parca[] = [];
  const ekle: Ekle = (q) => p.push({ malzeme: "govde", ...q, grup: GRUP.kose });
  const y0 = altY0(s);
  const H = O.altH;
  const D = O.altD;

  if (s.koseTur === "unite") {
    // L köşe ünitesi: ana duvar boyunca 90 cm gövde + yan duvar boyunca kalan 34 cm gövde, iki kapak
    const KW = KOSE_OLCU.unite.ana;
    const g = govde(ekle, KW / 2, y0, KW, H, D, "Köşe ünitesi");
    raflar(ekle, KW / 2, y0, H, g.icW, g.gD, g.gZ, 1);
    ekle({ tur: "baza", ad: "Baza", en: KW - D, boy: y0, derinlik: T, x: D + (KW - D) / 2, y: y0 / 2, z: D - 50, bantMm: KW - D });
    // Ana taraftaki kapak (köşenin dışında kalan kısım)
    kapaklar(ekle, s, D + (KW - D) / 2, KW - D, y0, y0 + H, g.onZ, "duz", "ust");
    // Yan taraf: yerel koordinatta üretilip çevrilir
    const yanP: Parca[] = [];
    const yanEkle: Ekle = (q) => yanP.push({ malzeme: "govde", ...q, grup: GRUP.kose });
    const yW = KOSE_OLCU.unite.yan - D;
    const yx = D + yW / 2;
    govde(yanEkle, yx, y0, yW, H, D, "Köşe ünitesi");
    yanEkle({ tur: "baza", ad: "Baza", en: yW, boy: y0, derinlik: T, x: yx, y: y0 / 2, z: D - 50, bantMm: yW });
    kapaklar(yanEkle, s, yx, yW, y0, y0 + H, D, "duz", "ust");
    p.push(...yanP.map(yanaCevir));
  } else {
    // Kör köşe: ana duvarda 100 cm dolap; ilk 58 cm'si yan duvardaki dolapların arkasında kalır
    const KW = KOSE_OLCU.kor.ana;
    const kor = KOSE_OLCU.kor.yan;
    const g = govde(ekle, KW / 2, y0, KW, H, D, "Kör köşe dolabı");
    raflar(ekle, KW / 2, y0, H, g.icW, g.gD, g.gZ, 1);
    ekle({ tur: "baza", ad: "Baza", en: KW - kor, boy: y0, derinlik: T, x: kor + (KW - kor) / 2, y: y0 / 2, z: D - 50, bantMm: KW - kor });
    ekle({ tur: "korPanel", ad: "Kör köşe paneli", en: kor, boy: H - 3, derinlik: T, x: kor / 2, y: y0 + H / 2, z: D + T / 2 + 1, bantMm: kor, malzeme: "on" });
    kapaklar(ekle, s, kor + (KW - kor) / 2, KW - kor, y0, y0 + H, g.onZ, "duz", "ust");
  }

  if (s.koseUst) {
    // L üst köşe dolabı: iki duvarda 60'ar cm
    const U = KOSE_UST;
    const UD = O.ustD;
    const g = govde(ekle, U / 2, O.ustY0, U, O.ustH, UD, "Üst köşe dolabı");
    raflar(ekle, U / 2, O.ustY0, O.ustH, g.icW, g.gD, g.gZ, 1);
    kapaklar(ekle, s, UD + (U - UD) / 2, U - UD, O.ustY0, O.ustY0 + O.ustH, g.onZ, "duz", "alt");
    const yanP: Parca[] = [];
    const yanEkle: Ekle = (q) => yanP.push({ malzeme: "govde", ...q, grup: GRUP.kose });
    const yW = U - UD;
    govde(yanEkle, UD + yW / 2, O.ustY0, yW, O.ustH, UD, "Üst köşe dolabı");
    kapaklar(yanEkle, s, UD + yW / 2, yW, O.ustY0, O.ustY0 + O.ustH, UD, "duz", "alt");
    p.push(...yanP.map(yanaCevir));
  }
  return p;
}

// Bir duvar boyunca tezgah parçaları (yerel koordinat). bas: tezgahın başladığı nokta, koseSon: köşe modülünün bittiği yer.
function siraTezgahi(s: DolapSecim, altlar: AltModul[], konum: { x0: number; w: number }[], bas: number, koseSon: number, grup: number): Parca[] {
  const O = DOLAP_OLCULERI[s.tur];
  const tezY = O.baza + O.altH + O.tezgahK / 2;
  const p: Parca[] = [];
  const parca = (x0: number, x1: number) => {
    if (x1 - x0 < 1) return;
    p.push({ tur: "tezgah", ad: "Tezgah (38 mm laminat)", grup, en: x1 - x0, boy: O.tezgahK, derinlik: O.tezgahD, x: (x0 + x1) / 2, y: tezY, z: O.tezgahD / 2, bantMm: 0, malzeme: "tezgah" });
  };
  let grupBas: number | null = bas;
  // Köşe modülünün üstü: sıranın ilk dolabı boy dolapsa köşe parçası ayrı kalır
  if (altlar.length === 0 || altlar[0].tur === "boy") {
    parca(bas, koseSon);
    grupBas = null;
  }
  altlar.forEach((m, i) => {
    const k = konum[i];
    if (m.tur === "boy") {
      if (grupBas !== null) parca(grupBas, k.x0);
      grupBas = null;
    } else if (grupBas === null) grupBas = k.x0;
  });
  if (grupBas !== null) {
    const son = konum.length ? konum[konum.length - 1].x0 + konum[konum.length - 1].w : koseSon;
    parca(grupBas, Math.max(son, koseSon));
  }
  return p;
}

export function dolapParcalari(s: DolapSecim): Parca[] {
  const O = DOLAP_OLCULERI[s.tur];
  const L = lMi(s);
  const K = koseOlcu(s);
  const ustBas = L ? (s.koseUst ? KOSE_UST : O.ustD) : 0;
  const ana = siraYerlesimi(s, s.altlar, s.ustler, K.ana, ustBas);

  const p: Parca[] = [
    ...s.altlar.flatMap((m, i) => altParcalari(s, m, GRUP.anaAlt + i, ana.alt[i].x0 + ana.alt[i].w / 2)),
    ...s.ustler.flatMap((m, i) => ustParcalari(s, m, GRUP.anaUst + i, ana.ust[i].x0 + ana.ust[i].w / 2)),
  ];
  if (s.tur === "mutfak") p.push(...siraTezgahi(s, s.altlar, ana.alt, 0, K.ana, GRUP.anaAlt));

  if (L) {
    const yan = siraYerlesimi(s, s.yanAltlar, s.yanUstler, K.yan, ustBas);
    const yanP: Parca[] = [
      ...s.yanAltlar.flatMap((m, i) => altParcalari(s, m, GRUP.yanAlt + i, yan.alt[i].x0 + yan.alt[i].w / 2)),
      ...s.yanUstler.flatMap((m, i) => ustParcalari(s, m, GRUP.yanUst + i, yan.ust[i].x0 + yan.ust[i].w / 2)),
      // Yan tezgah ana tezgahın arkasından (derinliği kadar ileriden) başlar
      ...siraTezgahi(s, s.yanAltlar, yan.alt, O.tezgahD, K.yan, GRUP.yanAlt),
    ];
    p.push(...yanP.map(yanaCevir), ...koseParcalari(s));
    // Sağ köşe: her şey aynalanır
    if (s.kose === "sag") for (const x of p) x.x = -x.x;
  }
  return p;
}

const lavaboFiyati = (wCm: number) =>
  wCm <= 60 ? FIYATLAR.lavabo60 : wCm <= 80 ? FIYATLAR.lavabo80 : FIYATLAR.lavabo100;

export function dolapFiyat(s: DolapSecim) {
  const F = FIYATLAR;
  const parcalar = dolapParcalari(s).filter((x) => !x.gosterim);
  const say = (t: string) => parcalar.filter((x) => x.tur === t).length;
  const carpan = s.tur === "banyo" ? F.banyoLevhaCarpani : 1;

  let govdeM2 = 0;
  let onM2 = 0;
  let hdfM2 = 0;
  let camM2 = 0;
  let aynaM2 = 0;
  let cerceveM = 0;
  let bantMm = 0;
  let tezgahM = 0;
  let mentese = 0;

  for (const x of parcalar) {
    switch (x.malzeme) {
      case "kulp":
        break;
      case "arka":
        hdfM2 += x.tur === "cekmeceTaban" ? m2(x.en, x.derinlik) : m2(x.en, x.boy);
        break;
      case "cam":
        camM2 += m2(x.en, x.boy);
        break;
      case "ayna":
        aynaM2 += m2(x.en, x.boy);
        break;
      case "cerceve":
        cerceveM += (2 * (x.en + x.boy)) / 1000;
        break;
      case "tezgah":
        tezgahM += Math.max(x.en, x.derinlik) / 1000;
        break;
      case "on":
        onM2 += levhaAlani(x);
        bantMm += x.bantMm;
        break;
      default:
        govdeM2 += levhaAlani(x);
        bantMm += x.bantMm;
    }
    if (x.tur === "kapak" || x.tur === "camCerceve") mentese += x.boy <= 900 ? 2 : x.boy <= 1600 ? 3 : 4;
  }

  const levhaM2 = govdeM2 + onM2;
  const malzeme =
    govdeM2 * (1 + F.fireOrani) * levhaBirim(s.renk) * carpan +
    onM2 * (1 + F.fireOrani) * levhaBirim(dolapOnRengi(s)) * carpan +
    hdfM2 * (1 + F.fireOrani) * F.arkalikM2 +
    camM2 * F.camM2 +
    cerceveM * F.camCerceveM +
    aynaM2 * F.aynaM2 +
    (bantMm / 1000) * 1.1 * F.bantM;

  const L = lMi(s);
  const altGovde = [...s.altlar, ...(L ? s.yanAltlar : [])].filter((m) => m.tur !== "bosluk").length + (L ? 1 : 0);
  const ustGovde = [...s.ustler, ...(L ? s.yanUstler : [])].filter((m) => m.tur !== "bosluk").length + (L && s.koseUst ? 1 : 0);
  const govdeSayisi = altGovde + ustGovde;
  const kapakSayisi = say("kapak") + say("camCerceve");
  const cekmeceSayisi = say("cekmeceOn");
  const kulpAdet = s.kulp === "yok" ? kapakSayisi + cekmeceSayisi : say("kulp");
  const ayakli = s.tur === "mutfak" || !s.asma;
  const kesim = [...s.altlar, ...(L ? s.yanAltlar : [])].filter((m) => m.tur === "evye" || m.tur === "ocak").length;
  const lavabolar = s.altlar.filter((m) => m.tur === "lavabo").reduce((t, m) => t + lavaboFiyati(m.genislik), 0);

  const donanim =
    govdeSayisi * F.donanimModul +
    (Math.max(0, altGovde - 1) + Math.max(0, ustGovde - 1)) * F.birlestirme +
    say("raf") * F.donanimRaf +
    mentese * F.mentese +
    cekmeceSayisi * F.cekmeceRayi +
    kulpAdet * KULPLAR[s.kulp].fiyat +
    (ayakli ? altGovde * 4 * F.ayarliAyak : altGovde * F.askiAparati) +
    ustGovde * F.askiAparati;

  // L tezgahta köşe birleşimi (gönye kesim + birleştirme) ayrıca ücretlendirilir
  const tezgah = tezgahM * F.tezgahM + kesim * F.tezgahKesim + (L ? F.tezgahKoseBirlesim : 0);

  const iscilik =
    F.iscilikSabit +
    govdeSayisi * F.iscilikModul +
    levhaM2 * F.iscilikM2 +
    kapakSayisi * F.iscilikKapak +
    cekmeceSayisi * F.iscilikCekmece;
  const ambalaj = govdeSayisi * F.ambalajModul + (levhaM2 + hdfM2 + camM2 + aynaM2) * F.ambalajM2;

  const maliyet = malzeme + donanim + tezgah + lavabolar + iscilik + ambalaj;
  return {
    levhaM2: Math.round(levhaM2 * 100) / 100,
    tezgahM: Math.round(tezgahM * 100) / 100,
    maliyet: Math.round(maliyet),
    fiyat: satisFiyati(maliyet),
  };
}

export function dolapOzeti(s: DolapSecim) {
  const L = lMi(s);
  const altAd = (k: string) => (ALT_SECENEKLERI[s.tur].find((x) => x.kod === k)?.ad ?? k).toLocaleLowerCase("tr-TR");
  const ustAd = (k: string) => (UST_SECENEKLERI[s.tur].find((x) => x.kod === k)?.ad ?? k).toLocaleLowerCase("tr-TR");
  const genel = [dolapOlcuMetni(s), RENKLER[s.renk].ad];
  if (L) {
    genel.push(`köşe ${s.kose === "sol" ? "solda" : "sağda"}, ${KOSE_TURLERI.find((k) => k.kod === s.koseTur)!.ad.toLocaleLowerCase("tr-TR")}${s.koseUst ? " + üst köşe" : ""}`);
  }
  if (s.kapakRenk !== "ayni") genel.push(`kapak ${RENKLER[s.kapakRenk].ad}`);
  if (s.tur === "mutfak") genel.push(`tezgah ${TEZGAH_RENKLERI[s.tezgah].ad.toLocaleLowerCase("tr-TR")}`);
  if (s.tur === "banyo") genel.push(s.asma ? "duvara asma" : "ayaklı");
  genel.push(s.kulp === "yok" ? "kulpsuz" : `${KULPLAR[s.kulp].ad.toLocaleLowerCase("tr-TR")} kulp`);
  const on = L ? "Ana " : "";
  return {
    genel: genel.join(" · "),
    altlar: [
      ...s.altlar.map((m, i) => `${on}alt ${i + 1}) ${m.genislik} cm ${altAd(m.tur)}`),
      ...(L ? s.yanAltlar.map((m, i) => `Yan alt ${i + 1}) ${m.genislik} cm ${altAd(m.tur)}`) : []),
    ],
    ustler: [
      ...s.ustler.map((m, i) => `${on}üst ${i + 1}) ${m.genislik} cm ${ustAd(m.tur)}`),
      ...(L ? s.yanUstler.map((m, i) => `Yan üst ${i + 1}) ${m.genislik} cm ${ustAd(m.tur)}`) : []),
    ],
  };
}

// Adres çubuğu: "60-cekmece_80-evye"
export const siraYaz = (m: { genislik: number; tur: string }[]) => m.map((x) => `${x.genislik}-${x.tur}`).join("_");

export function siraOku(metin: string | undefined) {
  if (metin === undefined) return undefined;
  if (metin === "") return [];
  return metin
    .split("_")
    .slice(0, MAX_MODUL)
    .map((p) => {
      const [g, tur] = p.split("-");
      return { genislik: Number(g), tur };
    });
}
