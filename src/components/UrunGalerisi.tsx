"use client";

import { useEffect, useState } from "react";

type Gorsel = { id: number; url: string };

const oklar = {
  sol: "M15 5l-7 7 7 7",
  sag: "M9 5l7 7-7 7",
};

function Ok({ yon, className = "h-5 w-5" }: { yon: "sol" | "sag"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={oklar[yon]} />
    </svg>
  );
}

export default function UrunGalerisi({ gorseller, ad }: { gorseller: Gorsel[]; ad: string }) {
  const [secili, setSecili] = useState(0);
  const [buyuk, setBuyuk] = useState(false);
  const [baslangicX, setBaslangicX] = useState<number | null>(null);

  const sayi = gorseller.length;
  const git = (yon: number) => setSecili((s) => (s + yon + sayi) % sayi);

  useEffect(() => {
    if (!buyuk) return;
    const tus = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuyuk(false);
      if (e.key === "ArrowLeft") git(-1);
      if (e.key === "ArrowRight") git(1);
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyuk, sayi]);

  if (sayi === 0) {
    return (
      <div className="flex aspect-4/3 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
        Görsel yakında
      </div>
    );
  }

  const aktif = gorseller[secili];

  const dokunmaBitti = (x: number) => {
    if (baslangicX === null) return;
    const fark = x - baslangicX;
    if (Math.abs(fark) > 50) git(fark < 0 ? 1 : -1);
    setBaslangicX(null);
  };

  const okClass =
    "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md transition hover:bg-white hover:scale-105";

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-lg bg-neutral-100"
        onTouchStart={(e) => setBaslangicX(e.touches[0].clientX)}
        onTouchEnd={(e) => dokunmaBitti(e.changedTouches[0].clientX)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={aktif.url}
          alt={ad}
          onClick={() => setBuyuk(true)}
          className="aspect-4/3 w-full cursor-zoom-in object-cover"
        />

        <button
          type="button"
          aria-label="Büyüt"
          onClick={() => setBuyuk(true)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-md transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5" />
          </svg>
        </button>

        {sayi > 1 && (
          <>
            <button type="button" aria-label="Önceki" onClick={() => git(-1)} className={`${okClass} left-3`}>
              <Ok yon="sol" />
            </button>
            <button type="button" aria-label="Sonraki" onClick={() => git(1)} className={`${okClass} right-3`}>
              <Ok yon="sag" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              {secili + 1} / {sayi}
            </span>
          </>
        )}
      </div>

      {sayi > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {gorseller.map((g, i) => (
            <button
              key={g.id}
              type="button"
              aria-label={`${i + 1}. görsel`}
              onClick={() => setSecili(i)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 transition md:h-20 md:w-24 ${
                i === secili
                  ? "border-brand-700"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {buyuk && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setBuyuk(false)}
        >
          <button
            type="button"
            aria-label="Kapat"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setBuyuk(false)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {sayi > 1 && (
            <>
              <button
                type="button"
                aria-label="Önceki"
                className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  git(-1);
                }}
              >
                <Ok yon="sol" className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Sonraki"
                className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  git(1);
                }}
              >
                <Ok yon="sag" className="h-6 w-6" />
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={aktif.url}
            alt={ad}
            className="max-h-full max-w-full rounded object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}