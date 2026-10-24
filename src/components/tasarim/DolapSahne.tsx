"use client";

import { useMemo } from "react";
import { Edges } from "@react-three/drei";
import {
  GRUP,
  dolapOlcuMetni,
  dolapOnRengi,
  dolapParcalari,
  dolapYerlesim,
  dolapYukseklik,
  lMi,
  type DolapSecim,
  type Duvar,
  type Kutu,
  type Sira,
} from "@/lib/tasarim/dolap";
import { RENKLER, TEZGAH_RENKLERI } from "@/lib/tasarim/fiyatlar";
import type { Parca } from "@/lib/tasarim/ortak";
import {
  MM,
  OlcuEtiketi,
  ParcaMesh,
  TasarimCanvas,
  etiketOlcusu,
  useRenkMalzemesi,
  useSabitMalzemeler,
} from "./sahneOrtak";

// Seçili dolap: bir duvarın alt/üst sırasındaki bir dolap ya da köşe modülü
export type Secili = { duvar: Duvar; sira: Sira; i: number } | { duvar: "kose" };

export function grupSecimi(g: number): Secili {
  if (g >= GRUP.kose) return { duvar: "kose" };
  if (g >= GRUP.yanUst) return { duvar: "yan", sira: "ust", i: g - GRUP.yanUst };
  if (g >= GRUP.yanAlt) return { duvar: "yan", sira: "alt", i: g - GRUP.yanAlt };
  if (g >= GRUP.anaUst) return { duvar: "ana", sira: "ust", i: g - GRUP.anaUst };
  return { duvar: "ana", sira: "alt", i: g };
}

type Props = { secim: DolapSecim; secili: Secili; sec: (s: Secili) => void };

export default function DolapSahne({ secim, secili, sec }: Props) {
  const parcalar = useMemo(() => dolapParcalari(secim).filter((p) => !p.gorunmez), [secim]);
  const Y = useMemo(() => dolapYerlesim(secim), [secim]);
  const L = lMi(secim);

  // Ürünün yerdeki kapladığı alan: sahneyi bunun ortasına göre kaydır
  const kutu = useMemo(() => {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const p of parcalar) {
      x0 = Math.min(x0, p.x - p.en / 2);
      x1 = Math.max(x1, p.x + p.en / 2);
      z0 = Math.min(z0, p.z - p.derinlik / 2);
      z1 = Math.max(z1, p.z + p.derinlik / 2);
    }
    return { x0: Math.min(x0, 0), x1: Math.max(x1, 0), z0: 0, z1 };
  }, [parcalar]);

  const cx = ((kutu.x0 + kutu.x1) / 2) * MM;
  const cz = ((kutu.z0 + kutu.z1) / 2) * MM;
  const w = (kutu.x1 - kutu.x0) * MM;
  const d = (kutu.z1 - kutu.z0) * MM;
  const h = dolapYukseklik(secim) * MM;
  const etiket = etiketOlcusu(Math.max(w, d), h);

  // Seçili dolabın kutusu
  let k: Kutu | null = null;
  let etiketMetni = "";
  if (secili.duvar === "kose") {
    k = Y.kose;
    etiketMetni = "Köşe";
  } else {
    const liste =
      secili.duvar === "ana"
        ? secili.sira === "alt" ? Y.anaAlt : Y.anaUst
        : secili.sira === "alt" ? Y.yanAlt : Y.yanUst;
    const moduller =
      secili.duvar === "ana"
        ? secili.sira === "alt" ? secim.altlar : secim.ustler
        : secili.sira === "alt" ? secim.yanAltlar : secim.yanUstler;
    k = liste[secili.i] ?? null;
    const m = moduller[secili.i];
    if (m) {
      const on = L ? (secili.duvar === "ana" ? "Ana " : "Yan ") : "";
      etiketMetni = `${on}${secili.sira === "alt" ? "alt" : "üst"} ${secili.i + 1} · ${m.genislik} cm`;
      if (!L) etiketMetni = etiketMetni.charAt(0).toLocaleUpperCase("tr-TR") + etiketMetni.slice(1);
    }
  }

  const sagKose = L && secim.kose === "sag";
  // L mutfakta kamera köşenin karşısından bakar
  const azimut: [number, number] | undefined = L ? (sagKose ? [-1.5, -0.05] : [0.05, 1.5]) : undefined;

  return (
    <TasarimCanvas
      w={w}
      h={h}
      d={d}
      azimut={azimut}
      duvar={{
        z: -cz,
        // L'de ana duvar yan duvardan başlayıp dolapların 1,5 m ötesine uzanır
        x: L ? (sagKose ? -cx - (w + 1.5) / 2 : -cx + (w + 1.5) / 2) : 0,
        uzunluk: L ? w + 1.5 : Math.max(6, w + 3),
      }}
      yanDuvar={L ? { x: -cx, z0: -cz, uzunluk: d + 1.5 } : undefined}
    >
      <group position={[-cx, 0, -cz]}>
        <Moduller parcalar={parcalar} secim={secim} grupSec={(g) => sec(grupSecimi(g))} />

        <OlcuEtiketi olcu={etiket} konum={[cx, h + 0.1 * etiket, cz + d / 2]} metin={`Toplam ${dolapOlcuMetni(secim)}`} />
        <OlcuEtiketi
          olcu={etiket}
          konum={[sagKose ? kutu.x0 * MM - 0.16 * etiket : kutu.x1 * MM + 0.16 * etiket, h / 2, 0.3]}
          metin={`${Math.round(h * 100)} cm`}
        />

        {k && (
          <>
            {etiketMetni && (
              <OlcuEtiketi
                olcu={etiket}
                vurgulu
                konum={[k.x * MM, k.tepe * MM + 0.07 * etiket, (k.z + k.sz / 2) * MM]}
                metin={etiketMetni}
              />
            )}
            <mesh position={[k.x * MM, ((k.alt + k.tepe) / 2) * MM, k.z * MM + 0.01]} renderOrder={5}>
              <boxGeometry args={[k.sx * MM + 0.02, (k.tepe - k.alt) * MM + 0.01, k.sz * MM + 0.02]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              <Edges color="#a8714a" lineWidth={2} />
            </mesh>
          </>
        )}
      </group>
    </TasarimCanvas>
  );
}

function Moduller({ parcalar, secim, grupSec }: { parcalar: Parca[]; secim: DolapSecim; grupSec: (g: number) => void }) {
  const govde = useRenkMalzemesi(secim.renk);
  const on = useRenkMalzemesi(dolapOnRengi(secim));
  const tezgah = useRenkMalzemesi(TEZGAH_RENKLERI[secim.tezgah]);
  const sabit = useSabitMalzemeler(secim.kulp, "siyah", secim.renk === "beyaz" ? "#e4e0da" : RENKLER[secim.renk].renk);

  const gruplar = useMemo(() => {
    const g = new Map<number, Parca[]>();
    for (const p of parcalar) {
      if (p.tur === "tezgah") continue;
      if (!g.has(p.grup)) g.set(p.grup, []);
      g.get(p.grup)!.push(p);
    }
    return [...g.entries()];
  }, [parcalar]);
  // Tezgah birden çok modülün üstünden geçer, tıklanınca modül seçmez
  const tezgahlar = parcalar.filter((p) => p.tur === "tezgah");

  return (
    <>
      {tezgahlar.map((p, i) => (
        <ParcaMesh key={`tezgah-${i}`} p={p} govde={govde} on={on} sabit={sabit} tezgah={tezgah} />
      ))}
      {gruplar.map(([grup, liste]) => (
        <group
          key={grup}
          onClick={(e) => {
            e.stopPropagation();
            grupSec(grup);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => document.body.style.removeProperty("cursor")}
        >
          {liste.map((p, j) => (
            <ParcaMesh key={`${p.tur}-${j}`} p={p} govde={govde} on={on} sabit={sabit} tezgah={tezgah} />
          ))}
        </group>
      ))}
    </>
  );
}
