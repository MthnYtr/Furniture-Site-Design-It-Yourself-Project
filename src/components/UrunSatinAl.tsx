"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { sepeteEkle } from "@/app/(site)/sepet/actions";

type Secenek = { id: number; ad: string; fiyat: number; stok: number; kod: string };

type Props = {
  urunId: number;
  urunKodu: string;
  stok: number;
  taban: number;
  indirimli: number | null;
  secenekler: Secenek[];
};

const tl = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";
const yuvarla = (n: number) => Math.round(n * 100) / 100;

function SepeteEkleDugmesi() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn btn-primary w-full py-3.5">
      {pending ? (
        "Ekleniyor..."
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h2.5l2.2 11h10.6L20.5 8H6.4" />
            <circle cx="9" cy="19.5" r="1.3" />
            <circle cx="17" cy="19.5" r="1.3" />
          </svg>
          SEPETE EKLE
        </>
      )}
    </button>
  );
}

export default function UrunSatinAl({ urunId, urunKodu, stok, taban, indirimli, secenekler }: Props) {
  const ilk = secenekler.find((s) => s.stok > 0) ?? secenekler[0];
  const [secili, setSecili] = useState<number | null>(ilk ? ilk.id : null);
  const aktif = secenekler.find((s) => s.id === secili);

  const oran = indirimli && taban > 0 && indirimli < taban ? indirimli / taban : null;
  const liste = aktif ? aktif.fiyat : taban;
  const satis = aktif ? (oran ? yuvarla(liste * oran) : null) : indirimli;
  const stokAdedi = aktif ? aktif.stok : stok;
  const stoktaVar = stokAdedi > 0;
  const kod = aktif?.kod || urunKodu;
  const indirimYuzde = satis ? Math.round((1 - satis / liste) * 100) : 0;

  return (
    <>
      <div className="p-5">
        {satis ? (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-3xl font-bold text-red-600">{tl(satis)}</span>
              <span className="text-base text-neutral-400 line-through">{tl(liste)}</span>
              {indirimYuzde > 0 && (
                <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                  %{indirimYuzde} İNDİRİM
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">Sepette indirimli fiyat</p>
          </>
        ) : (
          <span className="text-3xl font-bold text-neutral-900">{tl(liste)}</span>
        )}

        <p className="mt-3 text-xs text-neutral-500">
          Ürün kodu: <span className="font-mono font-semibold text-neutral-700">{kod}</span>
        </p>
      </div>

      {secenekler.length > 0 && (
        <div className="border-t border-neutral-100 p-5">
          <div className="mb-3 text-sm font-semibold">
            Seçenek: <span className="font-normal text-neutral-600">{aktif?.ad}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {secenekler.map((s) => (
              <button
                type="button"
                key={s.id}
                disabled={s.stok <= 0}
                onClick={() => setSecili(s.id)}
                className={`rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                  s.stok <= 0
                    ? "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 line-through"
                    : s.id === secili
                      ? "border-brand-700 bg-brand-50 text-brand-900 ring-1 ring-brand-700"
                      : "border-neutral-300 hover:border-brand-600"
                }`}
              >
                {s.ad}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pb-5">
        {stoktaVar ? (
          <>
            <p
              className={`mb-3 flex items-center gap-2 text-xs font-semibold ${
                stokAdedi <= 5 ? "text-amber-700" : "text-green-700"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${stokAdedi <= 5 ? "bg-amber-500" : "bg-green-600"}`} />
              {stokAdedi <= 5 ? `Son ${stokAdedi} ürün` : "Stokta var"}
            </p>
            <form action={sepeteEkle}>
              <input type="hidden" name="productId" value={urunId} />
              {aktif && <input type="hidden" name="variantId" value={aktif.id} />}
              <SepeteEkleDugmesi />
            </form>
          </>
        ) : (
          <button disabled className="btn w-full cursor-not-allowed bg-neutral-300 py-3.5 text-white">
            TÜKENDİ
          </button>
        )}
      </div>
    </>
  );
}