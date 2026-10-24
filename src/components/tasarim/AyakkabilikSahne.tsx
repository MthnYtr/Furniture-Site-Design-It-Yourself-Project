"use client";

import { useMemo } from "react";
import { ayakkabilikOnRengi, ayakkabilikParcalari, type AyakkabilikSecim } from "@/lib/tasarim/ayakkabilik";
import { RENKLER } from "@/lib/tasarim/fiyatlar";
import { MM, OlcuEtiketi, ParcaMesh, TasarimCanvas, useRenkMalzemesi, useSabitMalzemeler } from "./sahneOrtak";

export default function AyakkabilikSahne({ secim }: { secim: AyakkabilikSecim }) {
  const parcalar = useMemo(() => ayakkabilikParcalari(secim).filter((p) => !p.gorunmez), [secim]);
  const govde = useRenkMalzemesi(secim.renk);
  const on = useRenkMalzemesi(ayakkabilikOnRengi(secim));
  const sabit = useSabitMalzemeler(secim.kulp, "siyah", secim.renk === "beyaz" ? "#e4e0da" : RENKLER[secim.renk].renk);

  const w = secim.genislik * 10 * MM;
  const h = (secim.yukseklik * 10 + (secim.minder ? 68 : 18)) * MM;
  const d = secim.derinlik * 10 * MM;
  // Küçük bir mobilya: etiketler orantılı küçülsün
  const etiket = Math.max(0.55, Math.max(w, h * 1.1) / 1.6);

  return (
    <TasarimCanvas w={w} h={Math.max(h, 0.9)} d={d}>
      {parcalar.map((p, i) => (
        <ParcaMesh key={`${p.tur}-${i}`} p={p} govde={govde} on={on} sabit={sabit} />
      ))}
      <OlcuEtiketi olcu={etiket} konum={[0, h + 0.07 * etiket, d / 2]} metin={`${secim.genislik} cm`} />
      <OlcuEtiketi olcu={etiket} konum={[w / 2 + 0.14 * etiket, h / 2, d / 2]} metin={`${secim.yukseklik} cm`} />
      <OlcuEtiketi olcu={etiket} konum={[w / 2 + 0.12 * etiket, 0.05 * etiket, 0]} metin={`${secim.derinlik} cm`} />
    </TasarimCanvas>
  );
}
