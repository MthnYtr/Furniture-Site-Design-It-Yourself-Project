// Kendin Tasarla ürünlerinin (kitaplık, masa, ...) ortak parçaları.
// Hem tarayıcıda hem sunucuda çalışır. Ölçüler milimetre (mm).

import { FIYATLAR, KULPLAR, RENKLER, type KulpKodu, type RenkKodu } from "./fiyatlar";

export const sinirla = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
export const adimla = (n: number, adim: number) => Math.round(n / adim) * adim;
export const sayi = (v: unknown, yedek: number) => (Number.isFinite(Number(v)) ? Number(v) : yedek);

export function renkSec(v: unknown, yedek: RenkKodu = "beyaz"): RenkKodu {
  return (Object.keys(RENKLER) as RenkKodu[]).includes(v as RenkKodu) ? (v as RenkKodu) : yedek;
}

export function kulpSec(v: unknown): KulpKodu {
  return (Object.keys(KULPLAR) as KulpKodu[]).includes(v as KulpKodu) ? (v as KulpKodu) : "siyah";
}

export const evetMi = (v: unknown, yedek: boolean) => (v === undefined ? yedek : v === true);

// 3D'de hangi malzemeyle çizileceği
export type MalzemeTuru =
  | "govde" // gövde rengi
  | "on" // kapak / çekmece önü rengi
  | "tabla" // masa tablası (gövde rengi)
  | "arka" // HDF arkalık
  | "metal" // masa ayakları
  | "kulp"
  | "cam"
  | "cerceve" // cam kapak çerçevesi
  | "delik" // kablo deliği, evye çukuru
  | "tezgah" // mutfak tezgahı
  | "celik" // evye, batarya, beyaz eşya önü
  | "camSiyah" // ocak camı
  | "ocakGoz" // ocak gözleri
  | "seramik" // lavabo
  | "ayna"
  | "kumas"; // oturma minderi

// Tek bir parça: ölçüleri ve 3D konumu (merkez noktası). x: sağ, y: yukarı, z: öne doğru.
export type Parca = {
  tur: string;
  ad: string;
  grup: number; // 3D'de tıklanınca seçilen bölüm (kitaplıkta modül numarası)
  en: number; // x boyutu (mm)
  boy: number; // y boyutu (mm)
  derinlik: number; // z boyutu (mm)
  x: number;
  y: number;
  z: number;
  bantMm: number; // kenar bandı uzunluğu
  malzeme: MalzemeTuru;
  dikey?: boolean; // ahşap damarı dikey mi
  gorunmez?: boolean; // 3D'de çizilmez (çekmece kutusu gibi)
  gosterim?: boolean; // sadece görünüm için (evye, ocak, beyaz eşya): fiyata ve kesim listesine girmez
  silindir?: boolean; // kutu yerine silindir çiz (ocak gözü, kablo deliği)
};

export const m2 = (a: number, b: number) => (a * b) / 1_000_000;

// Bir levha parçasının alanı: en küçük ölçü kalınlıktır, alan diğer ikisinden
export function levhaAlani(p: Parca) {
  const [a, b] = [p.en, p.boy, p.derinlik].sort((x, y) => y - x);
  return m2(a, b);
}

export const levhaBirim = (renk: RenkKodu) => (RENKLER[renk].desenli ? FIYATLAR.levhaDesenliM2 : FIYATLAR.levhaDuzM2);

// Maliyetten müşteri fiyatına (KDV dahil, 10 TL'ye yuvarlanır)
export const satisFiyati = (maliyet: number) => Math.ceil((maliyet * FIYATLAR.karCarpani) / 10) * 10;
