"use client";

// Kendin Tasarla seçim panellerinin ortak parçaları (kitaplık, masa, ...).

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { tasarimSepeteEkle } from "@/app/(site)/sepet/actions";
import type { TasarimTuru } from "@/lib/tasarim/kayit";
import { KULPLAR, RENKLER, type KulpKodu, type RenkKodu } from "@/lib/tasarim/fiyatlar";

export const tl = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";

export function Baslik({ no, children }: { no: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2.5 text-sm font-bold text-brand-900">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-xs text-white">
        {no}
      </span>
      {children}
    </h2>
  );
}

export function OlcuAlani({
  etiket,
  deger,
  min,
  max,
  adim,
  degistir,
  ek,
}: {
  etiket: string;
  deger: number;
  min: number;
  max: number;
  adim: number;
  degistir: (n: number) => void;
  ek?: React.ReactNode; // etiketin yanında küçük düğme vb.
}) {
  // Kutuya yazarken her tuşta düzeltme yapmasın, kutudan çıkınca düzeltsin
  const [yazi, setYazi] = useState<string | null>(null);
  const bitir = () => {
    if (yazi !== null && yazi.trim() !== "") degistir(Number(yazi));
    setYazi(null);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-neutral-600">{etiket}</label>
          {ek}
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            inputMode="numeric"
            value={yazi ?? String(deger)}
            min={min}
            max={max}
            step={adim}
            onChange={(e) => setYazi(e.target.value)}
            onBlur={bitir}
            onKeyDown={(e) => e.key === "Enter" && bitir()}
            className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-right text-sm font-semibold focus:border-brand-600 focus:outline-none"
          />
          <span className="text-xs text-neutral-500">cm</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={adim}
        value={deger}
        onChange={(e) => degistir(Number(e.target.value))}
        className="w-full accent-brand-700"
        aria-label={etiket}
      />
      <div className="flex justify-between text-[11px] text-neutral-400">
        <span>{min} cm</span>
        <span>{max} cm</span>
      </div>
    </div>
  );
}

// Birkaç sabit değerden birini seçtiren düğme grubu (derinlik, yükseklik vb.)
export function SecenekDugmeleri<T extends string | number>({
  etiket,
  secenekler,
  deger,
  degistir,
  yazi = (v) => `${v} cm`,
}: {
  etiket: string;
  secenekler: readonly T[];
  deger: T;
  degistir: (v: T) => void;
  yazi?: (v: T) => string;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold text-neutral-600">{etiket}</div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${secenekler.length}, minmax(0, 1fr))` }}>
        {secenekler.map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => degistir(v)}
            aria-pressed={deger === v}
            className={`rounded-md border py-2 text-sm font-semibold transition-colors ${
              deger === v ? "border-brand-700 bg-brand-700 text-white" : "border-neutral-300 hover:border-brand-600"
            }`}
          >
            {yazi(v)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Anahtar({
  acik,
  degistir,
  baslik,
  aciklama,
}: {
  acik: boolean;
  degistir: (v: boolean) => void;
  baslik: string;
  aciklama: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={acik}
      onClick={() => degistir(!acik)}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-neutral-200 px-4 py-3 text-left transition-colors hover:border-brand-300"
    >
      <span>
        <span className="block text-sm font-semibold">{baslik}</span>
        <span className="block text-xs text-neutral-500">{aciklama}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${acik ? "bg-brand-700" : "bg-neutral-300"}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${acik ? "left-5.5" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

export function Sayac({
  baslik,
  aciklama,
  deger,
  min,
  max,
  degistir,
}: {
  baslik: string;
  aciklama: string;
  deger: number;
  min: number;
  max: number;
  degistir: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-semibold">{baslik}</div>
        <div className="text-xs text-neutral-500">{aciklama}</div>
      </div>
      <div className="flex shrink-0 items-center rounded-md border border-neutral-300">
        <button
          type="button"
          aria-label={`${baslik} azalt`}
          disabled={deger <= min}
          onClick={() => degistir(deger - 1)}
          className="h-10 w-10 text-lg font-semibold hover:bg-brand-50 disabled:opacity-40"
        >
          −
        </button>
        <span className="w-9 text-center font-bold">{deger}</span>
        <button
          type="button"
          aria-label={`${baslik} artır`}
          disabled={deger >= max}
          onClick={() => degistir(deger + 1)}
          className="h-10 w-10 text-lg font-semibold hover:bg-brand-50 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

function RenkYuvarlak({ kod, sec }: { kod: RenkKodu; sec: boolean }) {
  const r = RENKLER[kod];
  return (
    <span
      className={`h-11 w-11 rounded-full border-2 shadow-inner transition ${
        sec ? "border-brand-700 ring-2 ring-brand-700/25" : "border-neutral-200 group-hover:border-brand-300"
      }`}
      style={{
        background: r.damar
          ? `repeating-linear-gradient(100deg, ${r.renk} 0 5px, ${r.damar} 5px 6px, ${r.renk} 6px 11px)`
          : r.renk,
      }}
    />
  );
}

// Renk seçimi. "ayniSecenegi" verilirse başta "Gövdeyle aynı" seçeneği çıkar.
export function RenkSecici<T extends RenkKodu | "ayni">({
  deger,
  degistir,
  ayniSecenegi = false,
}: {
  deger: T;
  degistir: (v: T) => void;
  ayniSecenegi?: boolean;
}) {
  const kodlar = Object.keys(RENKLER) as RenkKodu[];
  return (
    <div className={`grid gap-2 ${ayniSecenegi ? "grid-cols-6" : "grid-cols-5"}`}>
      {ayniSecenegi && (
        <button
          type="button"
          onClick={() => degistir("ayni" as T)}
          aria-pressed={deger === "ayni"}
          className="group flex flex-col items-center gap-1.5"
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed text-[10px] font-bold transition ${
              deger === "ayni" ? "border-brand-700 text-brand-800 ring-2 ring-brand-700/25" : "border-neutral-300 text-neutral-500"
            }`}
          >
            =
          </span>
          <span className={`text-center text-[11px] leading-tight ${deger === "ayni" ? "font-bold text-brand-900" : "text-neutral-600"}`}>
            Gövdeyle aynı
          </span>
        </button>
      )}
      {kodlar.map((k) => {
        const sec = deger === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => degistir(k as T)}
            aria-pressed={sec}
            className="group flex flex-col items-center gap-1.5"
          >
            <RenkYuvarlak kod={k} sec={sec} />
            <span className={`text-center text-[11px] leading-tight ${sec ? "font-bold text-brand-900" : "text-neutral-600"}`}>
              {RENKLER[k].ad}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function KulpIkon({ kod }: { kod: KulpKodu }) {
  if (kod === "yok") {
    return (
      <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="6" y="6" width="28" height="28" rx="2" />
        <circle cx="20" cy="20" r="4" strokeDasharray="2 2" />
      </svg>
    );
  }
  const renk = KULPLAR[kod].renk;
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="6" y="6" width="28" height="28" rx="2" />
      <rect x="11" y="18" width="18" height="4" rx="2" fill={renk} stroke={kod === "krom" ? "#9aa0a6" : renk} />
    </svg>
  );
}

export function KulpSecici({ deger, degistir }: { deger: KulpKodu; degistir: (v: KulpKodu) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(KULPLAR) as KulpKodu[]).map((k) => {
        const sec = deger === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => degistir(k)}
            aria-pressed={sec}
            className={`flex flex-col items-center gap-1 rounded-md border px-1 py-2.5 transition-colors ${
              sec ? "border-brand-700 bg-brand-50 text-brand-800 ring-1 ring-brand-700" : "border-neutral-300 text-neutral-600 hover:border-brand-600"
            }`}
          >
            <KulpIkon kod={k} />
            <span className="text-[11px] font-semibold">{KULPLAR[k].ad}</span>
            <span className="text-[10px] text-neutral-500">{KULPLAR[k].aciklama}</span>
          </button>
        );
      })}
    </div>
  );
}

// 3D önizleme kutusu (sol taraf, masaüstünde sabit kalır)
export function OnizlemeKutusu({ children, ipucu }: { children: React.ReactNode; ipucu: string }) {
  return (
    <div className="lg:sticky lg:top-36">
      <div className="relative h-90 overflow-hidden rounded-xl border border-neutral-200 bg-[#f6f1ea] sm:h-115 lg:h-[calc(100vh-11rem)] lg:max-h-180">
        {children}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-neutral-600 shadow-sm">
          {ipucu}
        </div>
      </div>
    </div>
  );
}

function SepeteEkleDugme({ kucuk = false }: { kucuk?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`btn btn-primary ${kucuk ? "px-5 py-3" : "mt-4 w-full py-3.5"}`}>
      {pending ? "Ekleniyor…" : "Sepete ekle"}
    </button>
  );
}

// Tasarımı sepete ekleyen form: sadece tür ve tasarım sorgusu gönderilir, fiyatı sunucu hesaplar
function SepetFormu({ tur, sorgu, kucuk }: { tur: TasarimTuru; sorgu: string; kucuk?: boolean }) {
  return (
    <form action={tasarimSepeteEkle}>
      <input type="hidden" name="tur" value={tur} />
      <input type="hidden" name="sorgu" value={sorgu} />
      <SepeteEkleDugme kucuk={kucuk} />
    </form>
  );
}

// Fiyat kutusu (panelin altı) + telefonda alta sabit fiyat çubuğu
export function FiyatAlani({
  fiyat,
  olcu,
  not,
  tur,
  sorgu,
}: {
  fiyat: number;
  olcu: string;
  not: string;
  tur: TasarimTuru;
  sorgu: string;
}) {
  return (
    <>
      <div className="card border-brand-200 bg-brand-50/60 p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Fiyat</div>
            <div className="text-3xl font-bold text-brand-900">{tl(fiyat)}</div>
            <div className="text-xs text-neutral-500">KDV dahil</div>
          </div>
          <div className="text-right text-xs text-neutral-600">
            <div className="font-semibold text-brand-800">Özel üretim</div>
            <div>7–10 iş gününde kargoda</div>
          </div>
        </div>
        <SepetFormu tur={tur} sorgu={sorgu} />
        <p className="mt-2 text-center text-[11px] text-neutral-500">{not}</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="mx-auto flex max-w-330 items-center justify-between gap-4">
          <div>
            <div className="text-xl font-bold text-brand-900">{tl(fiyat)}</div>
            <div className="text-[11px] text-neutral-500">{olcu} · KDV dahil</div>
          </div>
          <SepetFormu tur={tur} sorgu={sorgu} kucuk />
        </div>
      </div>
    </>
  );
}
