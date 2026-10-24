"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  AYAK_TURLERI,
  MASA_SINIRLARI,
  masaDuzelt,
  masaFiyat,
  type AyakTuru,
  type CekmeceYeri,
  type MasaSecim,
} from "@/lib/tasarim/masa";
import { METAL_RENKLER, type MetalRenk } from "@/lib/tasarim/fiyatlar";
import {
  Anahtar,
  Baslik,
  FiyatAlani,
  KulpSecici,
  OlcuAlani,
  OnizlemeKutusu,
  RenkSecici,
  Sayac,
  SecenekDugmeleri,
} from "./ortakUi";

const MasaSahne = dynamic(() => import("./MasaSahne"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">3D önizleme yükleniyor…</div>
  ),
});

function AyakIkon({ tur }: { tur: AyakTuru }) {
  return (
    <svg viewBox="0 0 56 36" className="h-9 w-14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="2" y="4" width="52" height="4" rx="1" fill="currentColor" opacity="0.2" />
      {tur === "panel" && (
        <>
          <rect x="4" y="8" width="4" height="26" fill="currentColor" opacity="0.15" />
          <rect x="48" y="8" width="4" height="26" fill="currentColor" opacity="0.15" />
          <path d="M8 14h40" opacity="0.5" />
        </>
      )}
      {tur === "metalU" && (
        <>
          <path d="M7 8v26M13 8v26M5 34h10" strokeWidth="2.2" />
          <path d="M43 8v26M49 8v26M41 34h10" strokeWidth="2.2" />
        </>
      )}
      {tur === "metal4" && (
        <>
          <path d="M7 8v26M49 8v26M14 8v22M42 8v22" strokeWidth="2.2" />
          <path d="M7 10h42" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

const CEKMECE_YERLERI: { kod: CekmeceYeri; ad: string }[] = [
  { kod: "yok", ad: "Yok" },
  { kod: "sol", ad: "Solda" },
  { kod: "sag", ad: "Sağda" },
];

export default function MasaTasarla({ baslangic }: { baslangic: MasaSecim }) {
  const [secim, setSecim] = useState<MasaSecim>(baslangic);
  const guncelle = (yeni: Partial<MasaSecim>) => setSecim((s) => masaDuzelt({ ...s, ...yeni }));
  const S = MASA_SINIRLARI;

  // Tasarımın adres çubuğu yazımı: link paylaşımı ve sepete ekleme bunu kullanır
  const sorgu = useMemo(() => {
    const q = new URLSearchParams({
      g: String(secim.genislik),
      d: String(secim.derinlik),
      y: String(secim.yukseklik),
      ayak: secim.ayak,
      mr: secim.metalRenk,
      renk: secim.renk,
      c: secim.cekmece,
      cs: String(secim.cekmeceSayi),
      op: secim.onPanel ? "1" : "0",
      kd: secim.kabloDeligi ? "1" : "0",
      kulp: secim.kulp,
    });
    return q.toString();
  }, [secim]);
  useEffect(() => window.history.replaceState(null, "", `?${sorgu}`), [sorgu]);

  const fiyat = useMemo(() => masaFiyat(secim), [secim]);
  const cekmeceOlur = secim.genislik >= S.cekmeceMinGenislik;

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_400px] lg:items-start lg:pb-0">
      <OnizlemeKutusu ipucu="Döndürmek için sürükle · Yakınlaştırmak için kaydır">
        <MasaSahne secim={secim} />
      </OnizlemeKutusu>

      <div className="space-y-4">
        <div className="card p-5">
          <Baslik no={1}>Ölçüler</Baslik>
          <div className="space-y-5">
            <OlcuAlani
              etiket="Genişlik"
              deger={secim.genislik}
              min={S.genislik.min}
              max={S.genislik.max}
              adim={S.genislik.adim}
              degistir={(n) => guncelle({ genislik: n })}
            />
            <SecenekDugmeleri etiket="Derinlik" secenekler={S.derinlikler} deger={secim.derinlik} degistir={(d) => guncelle({ derinlik: d })} />
            <SecenekDugmeleri etiket="Yükseklik" secenekler={S.yukseklikler} deger={secim.yukseklik} degistir={(y) => guncelle({ yukseklik: y })} />
            <p className="text-xs text-neutral-500">Standart çalışma masası yüksekliği 74 cm&apos;dir.</p>
          </div>
        </div>

        <div className="card p-5">
          <Baslik no={2}>Ayak tipi</Baslik>
          <div className="grid grid-cols-3 gap-2">
            {AYAK_TURLERI.map((a) => {
              const sec = secim.ayak === a.kod;
              return (
                <button
                  key={a.kod}
                  type="button"
                  onClick={() => guncelle({ ayak: a.kod })}
                  aria-pressed={sec}
                  title={a.aciklama}
                  className={`flex flex-col items-center gap-1.5 rounded-md border px-1 py-3 text-[11px] font-semibold transition-colors ${
                    sec ? "border-brand-700 bg-brand-50 text-brand-800 ring-1 ring-brand-700" : "border-neutral-300 text-neutral-600 hover:border-brand-600"
                  }`}
                >
                  <AyakIkon tur={a.kod} />
                  {a.ad}
                </button>
              );
            })}
          </div>
          {secim.ayak !== "panel" && (
            <div className="mt-4">
              <SecenekDugmeleri<MetalRenk>
                etiket="Metal rengi"
                secenekler={["siyah", "beyaz"]}
                deger={secim.metalRenk}
                degistir={(v) => guncelle({ metalRenk: v })}
                yazi={(v) => METAL_RENKLER[v].ad}
              />
            </div>
          )}
        </div>

        <div className="card space-y-4 p-5">
          <Baslik no={3}>Çekmece ünitesi</Baslik>
          {cekmeceOlur ? (
            <>
              <SecenekDugmeleri<CekmeceYeri>
                etiket="Konum"
                secenekler={CEKMECE_YERLERI.map((c) => c.kod)}
                deger={secim.cekmece}
                degistir={(v) => guncelle({ cekmece: v })}
                yazi={(v) => CEKMECE_YERLERI.find((c) => c.kod === v)!.ad}
              />
              {secim.cekmece !== "yok" && (
                <>
                  <Sayac
                    baslik="Çekmece sayısı"
                    aciklama="40 cm genişliğinde, yere basan ünite"
                    deger={secim.cekmeceSayi}
                    min={1}
                    max={S.maxCekmece}
                    degistir={(n) => guncelle({ cekmeceSayi: n })}
                  />
                  <div>
                    <div className="mb-2 text-xs font-semibold text-neutral-600">Kulp</div>
                    <KulpSecici deger={secim.kulp} degistir={(v) => guncelle({ kulp: v })} />
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-neutral-600">
              Çekmece ünitesi için masa en az {S.cekmeceMinGenislik} cm olmalı (diz boşluğu kalsın diye).
            </p>
          )}
        </div>

        <div className="card p-5">
          <Baslik no={4}>Renk</Baslik>
          <RenkSecici deger={secim.renk} degistir={(v) => guncelle({ renk: v })} />
          <p className="mt-3 text-xs text-neutral-500">Tabla 25 mm, gövde 18 mm suntalam, kenarlar PVC bantlı.</p>
        </div>

        <div className="card space-y-2.5 p-5">
          <Baslik no={5}>Detaylar</Baslik>
          {secim.ayak === "panel" && (
            <Anahtar
              acik={secim.onPanel}
              degistir={(v) => guncelle({ onPanel: v })}
              baslik="Gizlilik paneli"
              aciklama="Arkada 35 cm panel, masayı sağlamlaştırır"
            />
          )}
          <Anahtar
            acik={secim.kabloDeligi}
            degistir={(v) => guncelle({ kabloDeligi: v })}
            baslik="Kablo deliği"
            aciklama="Arka kenarda 6 cm, kapaklı"
          />
        </div>

        <FiyatAlani
          tur={"masa"}
          sorgu={sorgu}
          fiyat={fiyat.fiyat}
          olcu={`${secim.genislik}×${secim.derinlik}×${secim.yukseklik} cm`}
          not="Ürün demonte gönderilir, montaj şeması kutudan çıkar."
        />
      </div>
    </div>
  );
}
