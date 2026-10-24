"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  AYAKKABILIK_SINIRLARI,
  AYAKKABILIK_TIPLERI,
  ayakkabilikDuzelt,
  ayakkabilikDuzeni,
  ayakkabilikFiyat,
  type AyakkabilikAyak,
  type AyakkabilikSecim,
  type AyakkabilikTipi,
} from "@/lib/tasarim/ayakkabilik";
import { Anahtar, Baslik, FiyatAlani, KulpSecici, OlcuAlani, OnizlemeKutusu, RenkSecici, SecenekDugmeleri } from "./ortakUi";

const AyakkabilikSahne = dynamic(() => import("./AyakkabilikSahne"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">3D önizleme yükleniyor…</div>
  ),
});

function TipIkon({ tip }: { tip: AyakkabilikTipi }) {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="5" y="5" width="30" height="30" rx="1" />
      {tip === "klapali" && <path d="M5 15h30M5 25h30M15 9h10M15 19h10M15 29h10" />}
      {tip === "kapakli" && <path d="M20 5v30M16 12v4M24 12v4" />}
      {tip === "acik" && <path d="M5 14h30M5 24h30" opacity="0.6" />}
    </svg>
  );
}

export default function AyakkabilikTasarla({ baslangic }: { baslangic: AyakkabilikSecim }) {
  const [secim, setSecim] = useState<AyakkabilikSecim>(baslangic);
  const guncelle = (yeni: Partial<AyakkabilikSecim>) => setSecim((s) => ayakkabilikDuzelt({ ...s, ...yeni }));
  const S = AYAKKABILIK_SINIRLARI;

  // Tasarımın adres çubuğu yazımı: link paylaşımı ve sepete ekleme bunu kullanır
  const sorgu = useMemo(() => {
    const q = new URLSearchParams({
      g: String(secim.genislik),
      y: String(secim.yukseklik),
      d: String(secim.derinlik),
      tip: secim.tip,
      renk: secim.renk,
      kr: secim.kapakRenk,
      kulp: secim.kulp,
      ayak: secim.ayak,
      mi: secim.minder ? "1" : "0",
    });
    return q.toString();
  }, [secim]);
  useEffect(() => window.history.replaceState(null, "", `?${sorgu}`), [sorgu]);

  const fiyat = useMemo(() => ayakkabilikFiyat(secim), [secim]);
  const d = ayakkabilikDuzeni(secim);
  const kapakli = secim.tip !== "acik";

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_400px] lg:items-start lg:pb-0">
      <OnizlemeKutusu ipucu="Döndürmek için sürükle · Yakınlaştırmak için kaydır">
        <AyakkabilikSahne secim={secim} />
      </OnizlemeKutusu>

      <div className="space-y-4">
        <div className="card space-y-5 p-5">
          <Baslik no={1}>Ölçüler</Baslik>
          <OlcuAlani
            etiket="Genişlik"
            deger={secim.genislik}
            min={S.genislik.min}
            max={S.genislik.max}
            adim={S.genislik.adim}
            degistir={(n) => guncelle({ genislik: n })}
          />
          <OlcuAlani
            etiket="Yükseklik"
            deger={secim.yukseklik}
            min={S.yukseklik.min}
            max={S.yukseklik.max}
            adim={S.yukseklik.adim}
            degistir={(n) => guncelle({ yukseklik: n })}
          />
          <SecenekDugmeleri etiket="Derinlik" secenekler={S.derinlikler} deger={secim.derinlik} degistir={(v) => guncelle({ derinlik: v })} />
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-brand-50 px-2 py-2.5">
              <div className="text-base font-bold text-brand-900">{d.bolme}</div>
              <div className="text-[11px] text-neutral-600">bölme</div>
            </div>
            <div className="rounded-md bg-brand-50 px-2 py-2.5">
              <div className="text-base font-bold text-brand-900">{secim.tip === "klapali" ? d.sira * d.bolme : d.raf * d.bolme}</div>
              <div className="text-[11px] text-neutral-600">{secim.tip === "klapali" ? "klapa" : "raf"}</div>
            </div>
            <div className="rounded-md bg-brand-50 px-2 py-2.5">
              <div className="text-base font-bold text-brand-900">~{d.kapasite}</div>
              <div className="text-[11px] text-neutral-600">çift ayakkabı</div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <Baslik no={2}>Tip</Baslik>
          <div className="grid grid-cols-3 gap-2">
            {AYAKKABILIK_TIPLERI.map((t) => {
              const sec = secim.tip === t.kod;
              return (
                <button
                  key={t.kod}
                  type="button"
                  onClick={() => guncelle({ tip: t.kod })}
                  aria-pressed={sec}
                  className={`flex flex-col items-center gap-0.5 rounded-md border px-1 py-2.5 text-[11px] font-semibold transition-colors ${
                    sec ? "border-brand-700 bg-brand-50 text-brand-800 ring-1 ring-brand-700" : "border-neutral-300 text-neutral-600 hover:border-brand-600"
                  }`}
                >
                  <TipIkon tip={t.kod} />
                  {t.ad}
                  <span className="text-center text-[10px] font-normal text-neutral-500">{t.aciklama}</span>
                </button>
              );
            })}
          </div>
          {secim.tip === "klapali" && (
            <p className="mt-3 text-xs text-neutral-500">Klapalı modelde 25–30 cm derinlik yeterlidir, ayakkabılar eğik durur.</p>
          )}
        </div>

        <div className="card space-y-5 p-5">
          <Baslik no={3}>Renk</Baslik>
          <div>
            <div className="mb-2 text-xs font-semibold text-neutral-600">Gövde</div>
            <RenkSecici deger={secim.renk} degistir={(v) => guncelle({ renk: v })} />
          </div>
          {kapakli && (
            <div>
              <div className="mb-2 text-xs font-semibold text-neutral-600">{secim.tip === "klapali" ? "Klapalar" : "Kapaklar"}</div>
              <RenkSecici ayniSecenegi deger={secim.kapakRenk} degistir={(v) => guncelle({ kapakRenk: v })} />
            </div>
          )}
        </div>

        {kapakli && (
          <div className="card p-5">
            <Baslik no={4}>Kulp</Baslik>
            <KulpSecici deger={secim.kulp} degistir={(v) => guncelle({ kulp: v })} />
          </div>
        )}

        <div className="card space-y-3 p-5">
          <Baslik no={kapakli ? 5 : 4}>Detaylar</Baslik>
          <SecenekDugmeleri<AyakkabilikAyak>
            etiket="Alt kısım"
            secenekler={["baza", "metal"]}
            deger={secim.ayak}
            degistir={(v) => guncelle({ ayak: v })}
            yazi={(v) => (v === "baza" ? "Baza (6 cm)" : "Metal ayak (10 cm)")}
          />
          {secim.yukseklik <= S.minderMaxYukseklik ? (
            <Anahtar
              acik={secim.minder}
              degistir={(v) => guncelle({ minder: v })}
              baslik="Oturma minderi"
              aciklama="Üstüne 5 cm kumaş minder, ayakkabı giyerken oturmak için"
            />
          ) : (
            <p className="text-xs text-neutral-500">
              Oturma minderi {S.minderMaxYukseklik} cm ve altındaki ayakkabılıklarda seçilebilir.
            </p>
          )}
        </div>

        <FiyatAlani
          tur={"ayakkabilik"}
          sorgu={sorgu}
          fiyat={fiyat.fiyat}
          olcu={`${secim.genislik}×${secim.yukseklik}×${secim.derinlik} cm`}
          not="Ölçüler dış ölçüdür. Ürün demonte gönderilir, montaj şeması kutudan çıkar."
        />
      </div>
    </div>
  );
}
