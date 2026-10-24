// Atölye için kesim listesi: bir tasarımın parçalarını malzemeye ve ölçüye göre gruplar.
// Aynı ölçüdeki parçalar tek satırda adetle gösterilir.

import { TASARIMLAR, type TasarimTuru } from "./kayit";
import type { Parca } from "./ortak";

export type KesimSatiri = {
  malzeme: string; // örn. "18 mm suntalam · Beyaz"
  ad: string;
  olcu: string; // "1764 × 282 mm"
  adet: number;
  bantM: number; // bu satırdaki toplam kenar bandı (metre)
};

export type KesimListesi = { satirlar: KesimSatiri[]; donanim: { ad: string; adet: number }[] };

function malzemeEtiketi(p: Parca, m: { govde: string; on: string; tezgah?: string; metal?: string }, kalinlik: number) {
  switch (p.malzeme) {
    case "govde":
      return `${kalinlik} mm suntalam · ${m.govde}`;
    case "on":
      return `${kalinlik} mm suntalam (kapak/ön) · ${m.on}`;
    case "tabla":
      return `${kalinlik} mm suntalam (tabla) · ${m.govde}`;
    case "tezgah":
      return `${kalinlik} mm laminat tezgah · ${m.tezgah ?? ""}`;
    case "arka":
      return "3 mm HDF";
    case "cam":
      return "4 mm cam";
    case "ayna":
      return "4 mm ayna";
    case "cerceve":
      return "Alüminyum cam çerçevesi";
    case "metal":
      return `Metal profil · ${m.metal ?? ""}`;
    case "kumas":
      return "Minder (kumaş)";
    default:
      return "";
  }
}

// Bunlar kesilmez, adet olarak listelenir
const DONANIM: Record<string, string> = {
  kulp: "Kulp",
  ayak: "Plastik ayak",
  kabloDeligi: "Kablo deliği kapağı",
};

export function kesimListesi(tur: TasarimTuru, sorgu: string): KesimListesi | null {
  const k = TASARIMLAR[tur];
  if (!k) return null;
  const s = k.oku(new URLSearchParams(sorgu));
  const m = k.malzemeler(s);
  const parcalar = (k.parcalar(s) as Parca[]).filter((p) => !p.gosterim);

  const satirlar = new Map<string, KesimSatiri>();
  const donanim = new Map<string, number>();

  for (const p of parcalar) {
    const donanimAdi = DONANIM[p.tur] ?? (p.malzeme === "kulp" ? "Kulp" : null);
    if (donanimAdi) {
      donanim.set(donanimAdi, (donanim.get(donanimAdi) ?? 0) + 1);
      continue;
    }
    // Ölçüler büyükten küçüğe: ilk ikisi kesim ölçüsü, en küçüğü kalınlık
    const [a, b, c] = [p.en, p.boy, p.derinlik].map((x) => Math.round(x)).sort((x, y) => y - x);
    const levha = ["govde", "on", "tabla", "tezgah", "arka", "cam", "ayna"].includes(p.malzeme);
    const olcu = levha ? `${a} × ${b} mm` : `${a} × ${b} × ${c} mm`;
    const malzeme = malzemeEtiketi(p, m, c);
    const anahtar = `${malzeme}|${p.ad}|${olcu}`;
    const var_ = satirlar.get(anahtar);
    if (var_) {
      var_.adet += 1;
      var_.bantM += p.bantMm / 1000;
    } else {
      satirlar.set(anahtar, { malzeme, ad: p.ad, olcu, adet: 1, bantM: p.bantMm / 1000 });
    }
  }

  const sirali = [...satirlar.values()].sort((x, y) => x.malzeme.localeCompare(y.malzeme, "tr") || x.ad.localeCompare(y.ad, "tr"));
  for (const r of sirali) r.bantM = Math.round(r.bantM * 100) / 100;
  return { satirlar: sirali, donanim: [...donanim.entries()].map(([ad, adet]) => ({ ad, adet })) };
}
