"use client";

import { useMemo } from "react";
import { Edges } from "@react-three/drei";
import {
  enYuksek,
  modulKonumlari,
  onRengi,
  parcalariHesapla,
  toplamGenislik,
  type KitaplikSecim,
} from "@/lib/tasarim/kitaplik";
import type { Parca } from "@/lib/tasarim/ortak";
import { RENKLER } from "@/lib/tasarim/fiyatlar";
import {
  MM,
  OlcuEtiketi,
  ParcaMesh,
  TasarimCanvas,
  etiketOlcusu,
  useRenkMalzemesi,
  useSabitMalzemeler,
} from "./sahneOrtak";

type Props = {
  secim: KitaplikSecim;
  seciliModul: number;
  modulSec: (i: number) => void;
};

export default function KitaplikSahne({ secim, seciliModul, modulSec }: Props) {
  const parcalar = useMemo(() => parcalariHesapla(secim), [secim]);
  const konumlar = useMemo(() => modulKonumlari(secim), [secim]);
  const w = toplamGenislik(secim) * 10 * MM;
  const h = enYuksek(secim) * 10 * MM;
  const d = secim.derinlik * 10 * MM;
  const etiket = etiketOlcusu(w, h);
  const cokModul = secim.moduller.length > 1;
  const farkliYukseklik = secim.moduller.some((m) => m.yukseklik !== secim.moduller[0].yukseklik);

  return (
    <TasarimCanvas w={w} h={h} d={d}>
      <Moduller parcalar={parcalar} secim={secim} modulSec={modulSec} />

      {/* Modül etiketleri: tek modülde genişlik, çok modülde "1 · 80 cm" */}
      {konumlar.map((k, i) => {
        const m = secim.moduller[i];
        const olcu = farkliYukseklik ? `${m.genislik}×${m.yukseklik}` : `${m.genislik} cm`;
        return (
          <OlcuEtiketi
            key={i}
            olcu={etiket}
            vurgulu={cokModul && i === seciliModul}
            konum={[k.merkez * MM, k.yukseklik * MM + 0.06 * etiket, d / 2]}
            metin={cokModul ? `${i + 1} · ${olcu}` : olcu}
          />
        );
      })}
      {cokModul && (
        <OlcuEtiketi olcu={etiket} konum={[0, h + 0.15 * etiket, d / 2]} metin={`Toplam ${toplamGenislik(secim)} cm`} />
      )}
      {!farkliYukseklik && (
        <OlcuEtiketi olcu={etiket} konum={[w / 2 + 0.14 * etiket, h / 2, d / 2]} metin={`${enYuksek(secim)} cm`} />
      )}
      <OlcuEtiketi olcu={etiket} konum={[w / 2 + 0.14 * etiket, 0.04 * etiket, 0]} metin={`${secim.derinlik} cm`} />

      {cokModul && konumlar[seciliModul] && (
        <SeciliCerceve
          x={konumlar[seciliModul].merkez * MM}
          w={konumlar[seciliModul].genislik * MM}
          h={konumlar[seciliModul].yukseklik * MM}
          d={d}
        />
      )}
    </TasarimCanvas>
  );
}

// Seçili modülün etrafında ince renkli çerçeve
function SeciliCerceve({ x, w, h, d }: { x: number; w: number; h: number; d: number }) {
  const pay = 0.012;
  return (
    <mesh position={[x, h / 2, 0]} renderOrder={5}>
      <boxGeometry args={[w + pay, h + pay, d + 0.04]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      <Edges color="#a8714a" lineWidth={2} />
    </mesh>
  );
}

function Moduller({
  parcalar,
  secim,
  modulSec,
}: {
  parcalar: Parca[];
  secim: KitaplikSecim;
  modulSec: (i: number) => void;
}) {
  const govde = useRenkMalzemesi(secim.renk);
  const on = useRenkMalzemesi(onRengi(secim));
  // Arkalık beyazda açık gri, diğer renklerde gövde renginde
  const sabit = useSabitMalzemeler(secim.kulp, "siyah", secim.renk === "beyaz" ? "#e4e0da" : RENKLER[secim.renk].renk);

  const gruplar = useMemo(() => {
    const g: Parca[][] = secim.moduller.map(() => []);
    for (const p of parcalar) if (!p.gorunmez) g[p.grup]?.push(p);
    return g;
  }, [parcalar, secim.moduller]);

  return (
    <>
      {gruplar.map((liste, i) => (
        <group
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            modulSec(i);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => document.body.style.removeProperty("cursor")}
        >
          {liste.map((p, j) => (
            <ParcaMesh key={`${p.tur}-${j}`} p={p} govde={govde} on={on} sabit={sabit} />
          ))}
        </group>
      ))}
    </>
  );
}
