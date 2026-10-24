"use client";

import { useMemo } from "react";
import { metalRafParcalari, metalRafToplamGenislik, type MetalRafSecim } from "@/lib/tasarim/metalRaf";
import { MM, OlcuEtiketi, ParcaMesh, TasarimCanvas, etiketOlcusu, useRenkMalzemesi, useSabitMalzemeler } from "./sahneOrtak";

export default function MetalRafSahne({ secim }: { secim: MetalRafSecim }) {
  const parcalar = useMemo(() => metalRafParcalari(secim), [secim]);
  const ahsap = useRenkMalzemesi(secim.ahsapRenk);
  const sabit = useSabitMalzemeler("siyah", secim.renk);

  const w = metalRafToplamGenislik(secim) * 10 * MM;
  const h = secim.yukseklik * 10 * MM;
  const d = secim.derinlik * 10 * MM;
  const etiket = etiketOlcusu(w, h);

  return (
    <TasarimCanvas w={w} h={h} d={d}>
      {parcalar.map((p, i) => (
        <ParcaMesh key={`${p.tur}-${i}`} p={p} govde={ahsap} on={ahsap} sabit={sabit} />
      ))}
      <OlcuEtiketi olcu={etiket} konum={[0, h + 0.07 * etiket, d / 2]} metin={`${metalRafToplamGenislik(secim)} cm`} />
      <OlcuEtiketi olcu={etiket} konum={[w / 2 + 0.14 * etiket, h / 2, d / 2]} metin={`${secim.yukseklik} cm`} />
      <OlcuEtiketi olcu={etiket} konum={[w / 2 + 0.12 * etiket, 0.05 * etiket, 0]} metin={`${secim.derinlik} cm`} />
    </TasarimCanvas>
  );
}
