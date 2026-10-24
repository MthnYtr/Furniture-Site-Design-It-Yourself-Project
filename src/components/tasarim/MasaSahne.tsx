"use client";

import { useMemo } from "react";
import { masaParcalari, type MasaSecim } from "@/lib/tasarim/masa";
import {
  MM,
  OlcuEtiketi,
  ParcaMesh,
  TasarimCanvas,
  useRenkMalzemesi,
  useSabitMalzemeler,
} from "./sahneOrtak";

export default function MasaSahne({ secim }: { secim: MasaSecim }) {
  const parcalar = useMemo(() => masaParcalari(secim).filter((p) => !p.gorunmez), [secim]);
  const govde = useRenkMalzemesi(secim.renk);
  const sabit = useSabitMalzemeler(secim.kulp, secim.metalRenk);

  const w = secim.genislik * 10 * MM;
  const h = secim.yukseklik * 10 * MM;
  const d = secim.derinlik * 10 * MM;
  // Masa kitaplıktan küçük: etiketler de orantılı küçülsün
  const etiket = Math.max(0.6, Math.max(w, h * 1.3) / 1.6);

  return (
    <TasarimCanvas w={w} h={h * 1.3} d={d}>
      {parcalar.map((p, i) => (
        <ParcaMesh key={`${p.tur}-${i}`} p={p} govde={govde} on={govde} sabit={sabit} />
      ))}

      <OlcuEtiketi olcu={etiket} konum={[0, h + 0.07 * etiket, d / 2]} metin={`${secim.genislik} cm`} />
      <OlcuEtiketi olcu={etiket} konum={[w / 2 + 0.14 * etiket, h / 2, d / 2]} metin={`${secim.yukseklik} cm`} />
      <OlcuEtiketi olcu={etiket} konum={[w / 2 + 0.12 * etiket, h + 0.02, -d / 4]} metin={`${secim.derinlik} cm`} />
    </TasarimCanvas>
  );
}
