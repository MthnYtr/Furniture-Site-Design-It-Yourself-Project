// Kendin Tasarla: modüler kitaplık / dolap modeli.
// Bu dosya hem tarayıcıda (3D önizleme, canlı fiyat) hem sunucuda (sepet/sipariş) kullanılır.
// Böylece müşterinin gördüğü fiyat ile siparişteki fiyat her zaman aynı formülden çıkar.
// Tüm iç hesaplar milimetre (mm) cinsindendir.
//
// Yapı: Tasarım = ortak ayarlar (derinlik, renk, kulp) + yan yana dizilen modüller.
// Her modül kendi gövdesi ve yüksekliği olan ayrı bir ünitedir (IKEA PAX / BILLY mantığı).

import { FIYATLAR, KULPLAR, RENKLER, type KulpKodu, type RenkKodu } from "./fiyatlar";
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

export type { Parca } from "./ortak";

export type KapakTuru = "yok" | "tam" | "alt" | "cam";

export const KAPAK_TURLERI: { kod: KapakTuru; ad: string; aciklama: string }[] = [
  { kod: "yok", ad: "Kapaksız", aciklama: "Açık raf" },
  { kod: "tam", ad: "Tam kapak", aciklama: "Tüm ön kapalı" },
  { kod: "alt", ad: "Alt kapak", aciklama: "Alt kapalı, üst açık" },
  { kod: "cam", ad: "Cam kapak", aciklama: "Çerçeveli cam" },
];

export const SINIRLAR = {
  modulGenislik: { min: 30, max: 90, adim: 5 }, // cm, rafların eğilmemesi için en fazla 90
  yukseklik: { min: 60, max: 240, adim: 5 }, // cm
  derinlikler: [25, 30, 35, 40], // cm
  maxModul: 6,
  maxCekmece: 3,
  minRafAraligi: 180, // mm: iki raf arasında kalması gereken en az boşluk
  ciftKapakGenislik: 60, // cm: bundan geniş modüllerde çift kapak
};

export const KALINLIK = 18; // mm gövde, raf, kapak
export const ARKALIK_KALINLIK = 3; // mm HDF
export const BAZA_YUKSEKLIK = 60; // mm
export const CEKMECE_YUKSEKLIK = 180; // mm: her çekmecenin iç gövde payı
const RAF_GERI = 20; // mm: raflar önden bu kadar içeride durur
const KAPAK_BOSLUK = 3; // mm: kapaklar arası boşluk
const ALT_KAPAK_HEDEF = 760; // mm: alt kapak bu yüksekliğe en yakın rafta biter
export const CERCEVE = 22; // mm: cam kapak çerçeve genişliği

export type Modul = {
  genislik: number; // cm
  yukseklik: number; // cm
  raf: number; // açık/üst bölümdeki raf sayısı
  kapak: KapakTuru;
  cekmece: number; // alttaki çekmece sayısı
};

export type KitaplikSecim = {
  derinlik: number; // cm
  renk: RenkKodu; // gövde rengi
  kapakRenk: RenkKodu | "ayni"; // kapak ve çekmece önü rengi ("ayni" = gövdeyle aynı)
  kulp: KulpKodu;
  arkalik: boolean;
  baza: boolean;
  moduller: Modul[];
};

export const VARSAYILAN_MODUL: Modul = { genislik: 80, yukseklik: 180, raf: 4, kapak: "yok", cekmece: 0 };

export const VARSAYILAN_SECIM: KitaplikSecim = {
  derinlik: 30,
  renk: "beyaz",
  kapakRenk: "ayni",
  kulp: "siyah",
  arkalik: true,
  baza: true,
  moduller: [{ ...VARSAYILAN_MODUL }],
};

export const onRengi = (s: KitaplikSecim): RenkKodu => (s.kapakRenk === "ayni" ? s.renk : s.kapakRenk);

// Gövdenin iç yüksekliği (alt tabla üstünden üst tabla altına)
function icYukseklik(yukseklikCm: number, baza: boolean) {
  return yukseklikCm * 10 - (baza ? BAZA_YUKSEKLIK : 0) - 2 * KALINLIK;
}

// Çekmece bölümünün kapladığı iç yükseklik (üstündeki ara tabla dahil)
function cekmeceBolumu(n: number) {
  return n > 0 ? n * CEKMECE_YUKSEKLIK + KALINLIK : 0;
}

export function maxCekmece(yukseklikCm: number, baza: boolean) {
  const icH = icYukseklik(yukseklikCm, baza);
  let n = 0;
  while (n < SINIRLAR.maxCekmece && icH - cekmeceBolumu(n + 1) >= SINIRLAR.minRafAraligi) n++;
  return n;
}

export function maxRaf(yukseklikCm: number, baza: boolean, cekmece: number) {
  const ust = icYukseklik(yukseklikCm, baza) - cekmeceBolumu(cekmece);
  return Math.max(0, Math.floor((ust - SINIRLAR.minRafAraligi) / (SINIRLAR.minRafAraligi + KALINLIK)));
}

function modulDuzelt(girdi: unknown, varsayilanY: number, baza: boolean): Modul {
  const g = (girdi ?? {}) as Partial<Record<keyof Modul, unknown>>;
  const S = SINIRLAR;
  const genislik = sinirla(
    adimla(sayi(g.genislik, VARSAYILAN_MODUL.genislik), S.modulGenislik.adim),
    S.modulGenislik.min,
    S.modulGenislik.max,
  );
  const yukseklik = sinirla(
    adimla(sayi(g.yukseklik, varsayilanY), S.yukseklik.adim),
    S.yukseklik.min,
    S.yukseklik.max,
  );
  const kapak = KAPAK_TURLERI.some((k) => k.kod === g.kapak) ? (g.kapak as KapakTuru) : "yok";
  const cekmece = sinirla(Math.floor(sayi(g.cekmece, 0)), 0, maxCekmece(yukseklik, baza));
  let raf = sinirla(Math.floor(sayi(g.raf, 4)), 0, maxRaf(yukseklik, baza, cekmece));
  // Alt kapak bir rafta biter, en az bir raf gerekir
  let k = kapak;
  if (k === "alt" && raf === 0) {
    if (maxRaf(yukseklik, baza, cekmece) >= 1) raf = 1;
    else k = "tam";
  }
  return { genislik, yukseklik, raf, kapak: k, cekmece };
}

// Dışarıdan gelen her seçimi (tarayıcı, çerez, link) güvenli sınırlara çeker
export function secimDuzelt(girdi: unknown): KitaplikSecim {
  const g = (girdi ?? {}) as Partial<Record<keyof KitaplikSecim | "yukseklik", unknown>>;
  const S = SINIRLAR;

  const d = sayi(g.derinlik, 30);
  const derinlik = S.derinlikler.includes(d) ? d : 30;
  const baza = evetMi(g.baza, true);
  const arkalik = evetMi(g.arkalik, true);
  const renk = renkSec(g.renk);
  const kapakRenk = g.kapakRenk === "ayni" || g.kapakRenk === undefined ? "ayni" : renkSec(g.kapakRenk, renk);
  const kulp = kulpSec(g.kulp);

  // Eski linklerde tek bir ortak yükseklik vardı, modüllerde yoksa onu kullan
  const varsayilanY = sayi(g.yukseklik, VARSAYILAN_MODUL.yukseklik);
  const ham = Array.isArray(g.moduller) && g.moduller.length > 0 ? g.moduller : [VARSAYILAN_MODUL];
  const moduller = ham.slice(0, S.maxModul).map((m) => modulDuzelt(m, varsayilanY, baza));

  return { derinlik, renk, kapakRenk, kulp, arkalik, baza, moduller };
}

export const toplamGenislik = (s: KitaplikSecim) => s.moduller.reduce((t, m) => t + m.genislik, 0);
export const enYuksek = (s: KitaplikSecim) => Math.max(...s.moduller.map((m) => m.yukseklik));

function modulParcalari(s: KitaplikSecim, m: Modul, no: number, ox: number): Parca[] {
  const T = KALINLIK;
  const W = m.genislik * 10;
  const H = m.yukseklik * 10;
  const D = s.derinlik * 10;
  const B = s.baza ? BAZA_YUKSEKLIK : 0;
  const A = s.arkalik ? ARKALIK_KALINLIK : 0;
  const kulpVar = s.kulp !== "yok";

  // Gövde parçaları arkalık kalınlığı kadar öne kayar, toplam gövde derinliği D kalır
  const govdeD = D - A;
  const govdeZ = A / 2;
  const onYuz = govdeZ + govdeD / 2; // gövdenin ön yüzü (z)

  const p: Parca[] = [];
  const ekle = (x: Omit<Parca, "grup" | "malzeme"> & { malzeme?: Parca["malzeme"] }) =>
    p.push({ malzeme: "govde", ...x, x: x.x + ox, grup: no });

  for (const taraf of [-1, 1]) {
    ekle({ tur: "yan", ad: "Yan panel", en: T, boy: H, derinlik: govdeD, x: taraf * (W / 2 - T / 2), y: H / 2, z: govdeZ, bantMm: H, dikey: true });
  }

  const icW = W - 2 * T;
  ekle({ tur: "ust", ad: "Üst tabla", en: icW, boy: T, derinlik: govdeD, x: 0, y: H - T / 2, z: govdeZ, bantMm: icW });
  ekle({ tur: "alt", ad: "Alt tabla", en: icW, boy: T, derinlik: govdeD, x: 0, y: B + T / 2, z: govdeZ, bantMm: icW });

  if (s.baza) {
    ekle({ tur: "baza", ad: "Baza (ön)", en: icW, boy: B, derinlik: T, x: 0, y: B / 2, z: onYuz - T / 2 - 20, bantMm: icW });
  }

  const icAlt = B + T;
  const icUst = H - T;

  // Çekmeceler: altta, üstlerinde bir ara tabla
  let rafAlt = icAlt;
  if (m.cekmece > 0) {
    const cekUst = icAlt + m.cekmece * CEKMECE_YUKSEKLIK;
    ekle({ tur: "araTabla", ad: "Çekmece üstü tabla", en: icW, boy: T, derinlik: govdeD, x: 0, y: cekUst + T / 2, z: govdeZ, bantMm: icW });
    rafAlt = cekUst + T;

    // Çekmece ön yüzleri, gövdenin altından ara tablanın ortasına kadar olan alanı eşit böler
    const onAlt = B;
    const onUst = cekUst + T / 2;
    const onH = (onUst - onAlt) / m.cekmece;
    const kutuD = govdeD - 50; // çekmece kutusu derinliği (arkada pay)
    const kutuW = icW - 26; // raylar için iki yanda 13 mm
    const kutuH = CEKMECE_YUKSEKLIK - 40;
    for (let i = 0; i < m.cekmece; i++) {
      const yOrta = onAlt + i * onH + onH / 2;
      const kutuY = icAlt + i * CEKMECE_YUKSEKLIK + 20;
      ekle({ tur: "cekmeceOn", ad: "Çekmece ön", en: W - KAPAK_BOSLUK, boy: onH - KAPAK_BOSLUK, derinlik: T, x: 0, y: yOrta, z: onYuz + T / 2 + 1, bantMm: 2 * (W + onH), malzeme: "on" });
      if (kulpVar) {
        ekle({ tur: "kulp", ad: "Kulp", en: Math.min(160, W * 0.4), boy: 12, derinlik: 12, x: 0, y: yOrta, z: onYuz + T + 12, bantMm: 0, malzeme: "kulp" });
      }
      // Çekmece kutusu (görünmez, kesim listesi ve fiyat için): 2 yan + ön/arka iç + taban
      for (const taraf of [-1, 1]) {
        ekle({ tur: "cekmeceGovde", ad: "Çekmece yanı", en: T, boy: kutuH, derinlik: kutuD, x: taraf * (kutuW / 2 - T / 2), y: kutuY + kutuH / 2, z: govdeZ, bantMm: kutuD, gorunmez: true });
      }
      for (const yer of [-1, 1]) {
        ekle({ tur: "cekmeceGovde", ad: "Çekmece ön/arka iç", en: kutuW - 2 * T, boy: kutuH, derinlik: T, x: 0, y: kutuY + kutuH / 2, z: govdeZ + yer * (kutuD / 2 - T / 2), bantMm: kutuW - 2 * T, gorunmez: true });
      }
      ekle({ tur: "cekmeceTaban", ad: "Çekmece tabanı (HDF)", en: kutuW, boy: ARKALIK_KALINLIK, derinlik: kutuD, x: 0, y: kutuY, z: govdeZ, bantMm: 0, gorunmez: true, malzeme: "arka" });
    }
  }

  // Raflar: çekmecelerin üstünde kalan alanda eşit aralıklı
  const rafH = icUst - rafAlt;
  const aralik = (rafH - m.raf * T) / (m.raf + 1);
  const rafY: number[] = [];
  for (let r = 1; r <= m.raf; r++) {
    const y = rafAlt + r * aralik + (r - 1) * T + T / 2;
    rafY.push(y);
    ekle({ tur: "raf", ad: "Raf", en: icW - 2, boy: T, derinlik: govdeD - RAF_GERI, x: 0, y, z: govdeZ - RAF_GERI / 2, bantMm: icW - 2 });
  }

  // Kapaklar
  if (m.kapak !== "yok") {
    const kapakAlt = m.cekmece > 0 ? rafAlt - T / 2 : B;
    let kapakUst = H;
    if (m.kapak === "alt" && rafY.length > 0) {
      // Alt kapak 76 cm'e en yakın rafın ortasında biter
      kapakUst = rafY.reduce((en, y) => (Math.abs(y - ALT_KAPAK_HEDEF) < Math.abs(en - ALT_KAPAK_HEDEF) ? y : en), rafY[0]);
    }
    const kapakH = kapakUst - kapakAlt - KAPAK_BOSLUK;
    const kapakY = kapakAlt + KAPAK_BOSLUK / 2 + kapakH / 2;
    const adet = m.genislik > SINIRLAR.ciftKapakGenislik ? 2 : 1;
    const kapakW = (W - KAPAK_BOSLUK * adet) / adet;
    const z = onYuz + T / 2 + 1;
    // Kulp: tam kapakta göz hizasında, alt kapakta kapağın üstüne yakın
    const kulpY =
      m.kapak === "alt" ? kapakAlt + kapakH - 70 : Math.min(kapakAlt + kapakH - 80, Math.max(kapakAlt + 80, 1050));

    for (let i = 0; i < adet; i++) {
      const x = -W / 2 + KAPAK_BOSLUK / 2 + kapakW / 2 + i * (kapakW + KAPAK_BOSLUK);
      // Tek kapak sağdan açılır; çift kapakta kulplar ortada
      const kulpX = adet === 1 ? x + kapakW / 2 - 40 : i === 0 ? x + kapakW / 2 - 40 : x - kapakW / 2 + 40;

      if (m.kapak === "cam") {
        ekle({ tur: "camCerceve", ad: "Cam kapak çerçevesi (alüminyum)", en: kapakW, boy: kapakH, derinlik: T, x, y: kapakY, z, bantMm: 0, malzeme: "cerceve" });
        ekle({ tur: "cam", ad: "Cam (4 mm)", en: kapakW - 2 * CERCEVE, boy: kapakH - 2 * CERCEVE, derinlik: 4, x, y: kapakY, z: z + 2, bantMm: 0, malzeme: "cam" });
      } else {
        ekle({ tur: "kapak", ad: "Kapak", en: kapakW, boy: kapakH, derinlik: T, x, y: kapakY, z, bantMm: 2 * (kapakW + kapakH), malzeme: "on", dikey: true });
      }
      if (kulpVar) {
        ekle({ tur: "kulp", ad: "Kulp", en: 12, boy: Math.min(128, kapakH * 0.3), derinlik: 12, x: kulpX, y: kulpY, z: z + T / 2 + 12, bantMm: 0, malzeme: "kulp" });
      }
    }
  }

  if (s.arkalik) {
    ekle({ tur: "arkalik", ad: "Arkalık (HDF)", en: W - 4, boy: H - B - 4, derinlik: A, x: 0, y: B + (H - B) / 2, z: -D / 2 + A / 2, bantMm: 0, malzeme: "arka", dikey: true });
  }

  return p;
}

// Modüllerin yatay konumları (mm): soldan sağa yan yana dizilir
export function modulKonumlari(s: KitaplikSecim) {
  const Wt = toplamGenislik(s) * 10;
  let x = -Wt / 2;
  return s.moduller.map((m) => {
    const w = m.genislik * 10;
    const merkez = x + w / 2;
    x += w;
    return { merkez, genislik: w, yukseklik: m.yukseklik * 10 };
  });
}

export function parcalariHesapla(s: KitaplikSecim): Parca[] {
  const konum = modulKonumlari(s);
  return s.moduller.flatMap((m, i) => modulParcalari(s, m, i, konum[i].merkez));
}

// Raflar arasındaki net boşluk (cm), müşteriye bilgi olarak gösterilir
export function rafAraligiCm(s: KitaplikSecim, m: Modul) {
  const ust = icYukseklik(m.yukseklik, s.baza) - cekmeceBolumu(m.cekmece);
  return Math.round((ust - m.raf * KALINLIK) / (m.raf + 1) / 10);
}

export type FiyatDokumu = {
  levhaM2: number;
  arkalikM2: number;
  camM2: number;
  bantM: number;
  malzeme: number;
  donanim: number;
  iscilik: number;
  ambalaj: number;
  maliyet: number;
  fiyat: number; // müşterinin ödeyeceği (KDV dahil)
};

export function fiyatHesapla(s: KitaplikSecim): FiyatDokumu {
  const F = FIYATLAR;
  const parcalar = parcalariHesapla(s);
  const say = (t: string) => parcalar.filter((x) => x.tur === t).length;

  let govdeM2 = 0;
  let onM2 = 0;
  let arkalikM2 = 0;
  let camM2 = 0;
  let cerceveM = 0;
  let bantMm = 0;
  let mentese = 0;

  for (const x of parcalar) {
    if (x.tur === "kulp") continue;
    if (x.tur === "arkalik") {
      arkalikM2 += m2(x.en, x.boy);
      continue;
    }
    if (x.tur === "cekmeceTaban") {
      arkalikM2 += m2(x.en, x.derinlik);
      continue;
    }
    if (x.tur === "cam") {
      camM2 += m2(x.en, x.boy);
      continue;
    }
    if (x.tur === "camCerceve") {
      cerceveM += (2 * (x.en + x.boy)) / 1000;
    } else if (x.malzeme === "on") {
      onM2 += levhaAlani(x);
      bantMm += x.bantMm;
    } else {
      govdeM2 += levhaAlani(x);
      bantMm += x.bantMm;
    }
    if (x.tur === "kapak" || x.tur === "camCerceve") {
      mentese += x.boy <= 900 ? 2 : x.boy <= 1600 ? 3 : 4;
    }
  }

  const levhaM2 = govdeM2 + onM2;
  const bantM = bantMm / 1000;
  const malzeme =
    govdeM2 * (1 + F.fireOrani) * levhaBirim(s.renk) +
    onM2 * (1 + F.fireOrani) * levhaBirim(onRengi(s)) +
    arkalikM2 * (1 + F.fireOrani) * F.arkalikM2 +
    camM2 * F.camM2 +
    cerceveM * F.camCerceveM +
    bantM * 1.1 * F.bantM;

  const moduller = s.moduller.length;
  const kapaklar = say("kapak") + say("camCerceve");
  const cekmeceler = say("cekmeceOn");
  // Kulpsuzda her kapak ve çekmeceye bas-aç mekanizması takılır
  const kulpAdet = s.kulp === "yok" ? kapaklar + cekmeceler : say("kulp");
  const donanim =
    moduller * F.donanimModul +
    (moduller - 1) * F.birlestirme +
    say("raf") * F.donanimRaf +
    mentese * F.mentese +
    cekmeceler * F.cekmeceRayi +
    kulpAdet * KULPLAR[s.kulp].fiyat;
  const iscilik =
    F.iscilikSabit +
    moduller * F.iscilikModul +
    levhaM2 * F.iscilikM2 +
    kapaklar * F.iscilikKapak +
    cekmeceler * F.iscilikCekmece;
  const ambalaj = moduller * F.ambalajModul + (levhaM2 + arkalikM2 + camM2) * F.ambalajM2;

  const maliyet = malzeme + donanim + iscilik + ambalaj;

  const yuv = (n: number) => Math.round(n * 100) / 100;
  return {
    levhaM2: yuv(levhaM2),
    arkalikM2: yuv(arkalikM2),
    camM2: yuv(camM2),
    bantM: yuv(bantM),
    malzeme: Math.round(malzeme),
    donanim: Math.round(donanim),
    iscilik: Math.round(iscilik),
    ambalaj: Math.round(ambalaj),
    maliyet: Math.round(maliyet),
    fiyat: satisFiyati(maliyet),
  };
}

const KAPAK_KISA: Record<KapakTuru, string> = { yok: "kapaksız", tam: "tam kapak", alt: "alt kapak", cam: "cam kapak" };

// Sepette ve siparişte görünecek kısa açıklama
export function secimOzeti(s: KitaplikSecim) {
  const genel = [`${toplamGenislik(s)}×${enYuksek(s)}×${s.derinlik} cm`, RENKLER[s.renk].ad, `${s.moduller.length} modül`];
  if (s.kapakRenk !== "ayni") genel.push(`kapak ${RENKLER[s.kapakRenk].ad}`);
  genel.push(s.kulp === "yok" ? "kulpsuz" : `${KULPLAR[s.kulp].ad.toLocaleLowerCase("tr-TR")} kulp`);
  if (!s.arkalik) genel.push("arkalıksız");
  if (!s.baza) genel.push("bazasız");
  const moduller = s.moduller.map((m, i) => {
    const x = [`${m.genislik}×${m.yukseklik} cm`, `${m.raf} raf`, KAPAK_KISA[m.kapak]];
    if (m.cekmece) x.push(`${m.cekmece} çekmece`);
    return `${i + 1}) ${x.join(", ")}`;
  });
  return { genel: genel.join(" · "), moduller };
}

// Adres çubuğu için kısa yazım: "80x180-4-yok-0_60x120-3-tam-1"
export function modulleriYaz(m: Modul[]) {
  return m.map((x) => `${x.genislik}x${x.yukseklik}-${x.raf}-${x.kapak}-${x.cekmece}`).join("_");
}

export function modulleriOku(metin: string | undefined): Partial<Modul>[] | undefined {
  if (!metin) return undefined;
  const sonuc = metin
    .split("_")
    .slice(0, SINIRLAR.maxModul)
    .map((p) => {
      const [olcu, r, k, c] = p.split("-");
      const [g, y] = olcu.split("x");
      return {
        genislik: Number(g),
        yukseklik: y ? Number(y) : undefined,
        raf: Number(r),
        kapak: k as KapakTuru,
        cekmece: Number(c),
      };
    });
  return sonuc.length ? sonuc : undefined;
}
