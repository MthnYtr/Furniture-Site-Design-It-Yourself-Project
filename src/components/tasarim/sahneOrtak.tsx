"use client";

// Kendin Tasarla 3D sahnelerinin ortak parçaları: ışık, zemin, kamera, malzemeler, ölçü etiketleri.
// Kitaplık ve masa sahneleri bunları kullanır.

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Edges, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { CERCEVE } from "@/lib/tasarim/kitaplik";
import {
  KULPLAR,
  METAL_RENKLER,
  RENKLER,
  type KulpKodu,
  type MetalRenk,
  type RenkKodu,
  type RenkTanimi,
} from "@/lib/tasarim/fiyatlar";
import type { Parca } from "@/lib/tasarim/ortak";

export const MM = 0.001; // sahne birimi metre

// Ahşap desenli renkler için basit damar dokusu (dosya indirmeden, kodla çizilir)
function damarDokusu(zemin: string, damar: string, yatay: boolean) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = zemin;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = damar;
  for (let i = 0; i < 46; i++) {
    g.globalAlpha = 0.08 + Math.random() * 0.18;
    g.lineWidth = 0.6 + Math.random() * 2.2;
    const p = Math.random() * 256;
    const dalga = 2 + Math.random() * 5;
    g.beginPath();
    for (let t = 0; t <= 256; t += 8) {
      const s = p + Math.sin(t / (18 + i)) * dalga;
      if (yatay) {
        if (t === 0) g.moveTo(t, s);
        else g.lineTo(t, s);
      } else if (t === 0) g.moveTo(s, t);
      else g.lineTo(s, t);
    }
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export type RenkMalzemesi = { dikey: THREE.Material; yatay: THREE.Material; kenar: string };

// Bir renk için dikey ve yatay damarlı iki malzeme
export function useRenkMalzemesi(kod: RenkKodu | RenkTanimi): RenkMalzemesi {
  const r = typeof kod === "string" ? RENKLER[kod] : kod;
  const m = useMemo(() => {
    const dikey = r.damar ? damarDokusu(r.renk, r.damar, false) : null;
    const yatay = r.damar ? damarDokusu(r.renk, r.damar, true) : null;
    // Koyu renklerde biraz parlaklık: ışığı yansıtsın, parçalar seçilsin
    // Koyu renklere hafif kendi ışığı (emissive) verilir: siyah tamamen kararıp detaylar kaybolmasın
    const ayar = {
      roughness: r.desenli ? 0.75 : r.koyu ? 0.42 : 0.55,
      metalness: 0,
      ...(r.koyu ? { emissive: new THREE.Color(r.renk), emissiveIntensity: 0.45 } : {}),
    };
    return {
      dikey: new THREE.MeshStandardMaterial({ color: dikey ? "#ffffff" : r.renk, map: dikey, ...ayar }),
      yatay: new THREE.MeshStandardMaterial({ color: yatay ? "#ffffff" : r.renk, map: yatay, ...ayar }),
      kenar: r.kenar,
    };
  }, [r]);

  useEffect(
    () => () => {
      for (const x of [m.dikey, m.yatay]) {
        (x as THREE.MeshStandardMaterial).map?.dispose();
        x.dispose();
      }
    },
    [m],
  );
  return m;
}

type SabitTur = "arka" | "kulp" | "metal" | "cam" | "cerceve" | "delik" | "celik" | "camSiyah" | "ocakGoz" | "seramik" | "ayna" | "kumas";
export type SabitMalzemeler = Record<SabitTur, THREE.Material>;

export function useSabitMalzemeler(kulp: KulpKodu, metalRenk: MetalRenk = "siyah", arkaRenk = "#e4e0da"): SabitMalzemeler {
  const m = useMemo(() => {
    const k = KULPLAR[kulp];
    return {
      arka: new THREE.MeshStandardMaterial({ color: arkaRenk, roughness: 0.85 }),
      kulp: new THREE.MeshStandardMaterial({ color: k.renk, roughness: kulp === "krom" ? 0.22 : 0.4, metalness: k.metal }),
      metal: new THREE.MeshStandardMaterial({
        color: METAL_RENKLER[metalRenk].renk,
        roughness: 0.45,
        metalness: METAL_RENKLER[metalRenk].metal ?? 0.35,
      }),
      kumas: new THREE.MeshStandardMaterial({ color: "#b8ab98", roughness: 0.95 }),
      cerceve: new THREE.MeshStandardMaterial({ color: "#b4b6b9", roughness: 0.35, metalness: 0.25 }),
      cam: new THREE.MeshPhysicalMaterial({ color: "#dfe9ea", roughness: 0.05, transparent: true, opacity: 0.28, depthWrite: false }),
      delik: new THREE.MeshStandardMaterial({ color: "#1c1c1c", roughness: 0.6 }),
      celik: new THREE.MeshStandardMaterial({ color: "#c8cbcf", roughness: 0.3, metalness: 0.35 }),
      camSiyah: new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.08, metalness: 0.1 }),
      ocakGoz: new THREE.MeshStandardMaterial({ color: "#4d4d4d", roughness: 0.5 }),
      seramik: new THREE.MeshStandardMaterial({ color: "#fbfbfa", roughness: 0.2 }),
      ayna: new THREE.MeshStandardMaterial({
        color: "#dfe8ec",
        roughness: 0.05,
        metalness: 0.3,
        emissive: new THREE.Color("#b9c8cf"),
        emissiveIntensity: 0.25,
      }),
    };
  }, [kulp, metalRenk, arkaRenk]);

  useEffect(() => () => Object.values(m).forEach((x) => x.dispose()), [m]);
  return m;
}

export function ParcaMesh({
  p,
  govde,
  on,
  sabit,
  tezgah,
}: {
  p: Parca;
  govde: RenkMalzemesi;
  on: RenkMalzemesi;
  sabit: SabitMalzemeler;
  tezgah?: RenkMalzemesi;
}) {
  const pos: [number, number, number] = [p.x * MM, p.y * MM, p.z * MM];
  const renkli = p.malzeme === "govde" || p.malzeme === "tabla" || p.malzeme === "on" || p.malzeme === "tezgah";
  const takim = p.malzeme === "on" ? on : p.malzeme === "tezgah" && tezgah ? tezgah : govde;
  const malzeme = renkli ? (p.dikey ? takim.dikey : takim.yatay) : sabit[p.malzeme as keyof SabitMalzemeler];

  // Cam kapak çerçevesi: dört ince çıta
  if (p.malzeme === "cerceve") {
    const c = CERCEVE;
    const w = p.en;
    const h = p.boy;
    const citalar: [number, number, number, number][] = [
      [0, h / 2 - c / 2, w, c],
      [0, -h / 2 + c / 2, w, c],
      [-w / 2 + c / 2, 0, c, h - 2 * c],
      [w / 2 - c / 2, 0, c, h - 2 * c],
    ];
    return (
      <group position={pos}>
        {citalar.map(([x, y, cw, ch], i) => (
          <mesh key={i} position={[x * MM, y * MM, 0]} material={malzeme} castShadow>
            <boxGeometry args={[cw * MM, ch * MM, p.derinlik * MM]} />
          </mesh>
        ))}
      </group>
    );
  }

  if (p.silindir || p.malzeme === "delik") {
    return (
      <mesh position={pos} material={malzeme}>
        <cylinderGeometry args={[(p.en / 2) * MM, (p.en / 2) * MM, p.boy * MM, 32]} />
      </mesh>
    );
  }

  const cam = p.malzeme === "cam";
  return (
    <mesh position={pos} material={malzeme} castShadow={!cam} receiveShadow={!cam}>
      <boxGeometry args={[p.en * MM, p.boy * MM, p.derinlik * MM]} />
      {renkli && <Edges color={takim.kenar} threshold={15} />}
    </mesh>
  );
}

// Ölçü değişince kamerayı aynı açıdan, ürün ekrana sığacak uzaklığa getirir
function KameraSigdir({ w, h, d }: { w: number; h: number; d: number }) {
  const { camera, invalidate } = useThree();
  const controls = useThree((s) => s.controls) as unknown as {
    target: THREE.Vector3;
    update: () => void;
  } | null;

  useEffect(() => {
    const hedef = new THREE.Vector3(0, h / 2, 0);
    const boyut = Math.max(w, h * 1.1, d * 1.2);
    const persp = camera as THREE.PerspectiveCamera;
    const uzaklik = (boyut / 2 / Math.tan((persp.fov * Math.PI) / 360)) * 1.35;

    const yon = camera.position.clone().sub(controls?.target ?? hedef);
    if (yon.lengthSq() < 1e-6) yon.set(0.55, 0.25, 1);
    yon.normalize().multiplyScalar(uzaklik);

    camera.position.copy(hedef.clone().add(yon));
    controls?.target.copy(hedef);
    controls?.update();
    invalidate();
  }, [w, h, d, camera, controls, invalidate]);

  return null;
}

// Ölçü etiketi: kodla çizilen küçük bir resim (sprite), her zaman kameraya döner
export function OlcuEtiketi({
  konum,
  metin,
  olcu,
  vurgulu = false,
}: {
  konum: [number, number, number];
  metin: string;
  olcu: number;
  vurgulu?: boolean;
}) {
  const { doku, oran } = useMemo(() => {
    const c = document.createElement("canvas");
    const olcek = 4;
    const font = "700 20px system-ui, sans-serif";
    // Yazı uzunluğuna göre etiket genişliği
    const olc = c.getContext("2d")!;
    olc.font = font;
    const gen = Math.max(128, Math.ceil(olc.measureText(metin).width) + 32);
    c.width = gen * olcek;
    c.height = 44 * olcek;
    const g = c.getContext("2d")!;
    g.scale(olcek, olcek);
    g.fillStyle = vurgulu ? "#75472c" : "rgba(255,255,255,0.96)";
    g.beginPath();
    g.roundRect(2, 2, gen - 4, 40, 20);
    g.fill();
    g.strokeStyle = "rgba(0,0,0,0.08)";
    g.stroke();
    g.fillStyle = vurgulu ? "#ffffff" : "#432919";
    g.font = font;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(metin, gen / 2, 23);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return { doku: t, oran: gen / 128 };
  }, [metin, vurgulu]);

  useEffect(() => () => doku.dispose(), [doku]);

  return (
    <sprite position={konum} scale={[0.21 * olcu * oran, 0.072 * olcu, 1]} renderOrder={10}>
      <spriteMaterial map={doku} depthTest={false} transparent toneMapped={false} />
    </sprite>
  );
}

// Etiketler ürün büyüdükçe ekranda aynı boyda kalsın
export const etiketOlcusu = (w: number, h: number) => Math.max(1, Math.max(w, h * 1.1) / 1.6);

// Işık, gölge, zemin, döndürme ve kamera ayarı hazır sahne. w/h/d metre cinsinden ürün ölçüsü.
export function TasarimCanvas({
  w,
  h,
  d,
  duvar,
  yanDuvar,
  azimut,
  children,
}: {
  w: number;
  h: number;
  d: number;
  duvar?: { z: number; x?: number; uzunluk?: number }; // arkada duvar (z düzleminde, metre)
  yanDuvar?: { x: number; z0: number; uzunluk: number }; // L mutfakta ikinci duvar (x = sabit düzlem)
  azimut?: [number, number]; // kameranın dönebileceği yatay açı aralığı (radyan)
  children: React.ReactNode;
}) {
  // Başlangıç kamera açısı izin verilen aralığın ortası
  const aci = azimut ? (azimut[0] + azimut[1]) / 2 : 0.33;
  const kamera: [number, number, number] = [Math.sin(aci) * 3.4, 1.3, Math.cos(aci) * 3.4];
  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ fov: 35, near: 0.05, far: 50, position: kamera }}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.NeutralToneMapping }}
      onPointerMissed={() => document.body.style.removeProperty("cursor")}
    >
      <color attach="background" args={["#f6f1ea"]} />
      <hemisphereLight args={["#ffffff", "#d9cbb8", 1.35]} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[2.5, 4, 3]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-1}
      />
      {/* Önden hafif dolgu ışığı: koyu renklerde ön yüzler kaybolmasın */}
      <directionalLight position={[0, 1.2, 4]} intensity={0.45} />
      <directionalLight position={[-3, 2, -1]} intensity={0.35} />

      {children}

      {duvar !== undefined && (
        <mesh position={[duvar.x ?? 0, 1.5, duvar.z - 0.005]} receiveShadow>
          <planeGeometry args={[duvar.uzunluk ?? Math.max(6, w + 3), 3]} />
          <meshStandardMaterial color="#f4efe7" roughness={0.95} />
        </mesh>
      )}
      {yanDuvar && (
        <mesh
          position={[yanDuvar.x + (yanDuvar.x < 0 ? -0.005 : 0.005), 1.5, yanDuvar.z0 + yanDuvar.uzunluk / 2]}
          rotation={[0, yanDuvar.x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
          receiveShadow
        >
          <planeGeometry args={[yanDuvar.uzunluk, 3]} />
          <meshStandardMaterial color="#efe8de" roughness={0.95} />
        </mesh>
      )}

      <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={Math.max(4, w * 2.5)} blur={2.2} far={2.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.12} />
      </mesh>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={0.6}
        maxDistance={12}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2 - 0.05}
        // Duvar varsa arkasına dönülmesin
        minAzimuthAngle={azimut ? azimut[0] : duvar !== undefined ? -1.2 : -Infinity}
        maxAzimuthAngle={azimut ? azimut[1] : duvar !== undefined ? 1.2 : Infinity}
      />
      <KameraSigdir w={w} h={h} d={d} />
    </Canvas>
  );
}
