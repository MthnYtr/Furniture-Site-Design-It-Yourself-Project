"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  METAL_RAF_RENKLERI,
  METAL_RAF_SINIRLARI,
  metalRafDuzelt,
  metalRafFiyat,
  metalRafMaxRaf,
  metalRafToplamGenislik,
  type MetalRafSecim,
  type RafMalzeme,
} from "@/lib/tasarim/metalRaf";
import { METAL_RENKLER, type MetalRenk } from "@/lib/tasarim/fiyatlar";
import { Baslik, FiyatAlani, OlcuAlani, OnizlemeKutusu, RenkSecici, Sayac, SecenekDugmeleri } from "./ortakUi";

const MetalRafSahne = dynamic(() => import("./MetalRafSahne"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">3D önizleme yükleniyor…</div>
  ),
});

function MetalRenkSecici({ deger, degistir }: { deger: MetalRenk; degistir: (v: MetalRenk) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {METAL_RAF_RENKLERI.map((k) => {
        const r = METAL_RENKLER[k];
        const sec = deger === k;
        return (
          <button key={k} type="button" onClick={() => degistir(k)} aria-pressed={sec} className="group flex flex-col items-center gap-1.5">
            <span
              className={`h-11 w-11 rounded-full border-2 transition ${sec ? "border-brand-700 ring-2 ring-brand-700/25" : "border-neutral-200 group-hover:border-brand-300"}`}
              style={{
                background: k === "galvaniz" ? `linear-gradient(135deg, #d9dcdf, ${r.renk} 45%, #9ea3a8)` : r.renk,
              }}
            />
            <span className={`text-[11px] ${sec ? "font-bold text-brand-900" : "text-neutral-600"}`}>{r.ad}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function MetalRafTasarla({ baslangic }: { baslangic: MetalRafSecim }) {
  const [secim, setSecim] = useState<MetalRafSecim>(baslangic);
  const guncelle = (yeni: Partial<MetalRafSecim>) => setSecim((s) => metalRafDuzelt({ ...s, ...yeni }));
  const S = METAL_RAF_SINIRLARI;

  // Tasarımın adres çubuğu yazımı: link paylaşımı ve sepete ekleme bunu kullanır
  const sorgu = useMemo(() => {
    const q = new URLSearchParams({
      g: String(secim.genislik),
      d: String(secim.derinlik),
      y: String(secim.yukseklik),
      b: String(secim.bolme),
      r: String(secim.raf),
      rm: secim.rafMalzeme,
      renk: secim.renk,
      ar: secim.ahsapRenk,
    });
    return q.toString();
  }, [secim]);
  useEffect(() => window.history.replaceState(null, "", `?${sorgu}`), [sorgu]);

  const fiyat = useMemo(() => metalRafFiyat(secim), [secim]);
  const enCokRaf = metalRafMaxRaf(secim.yukseklik);
  const aralik = secim.raf > 1 ? Math.round((secim.yukseklik * 10 - 100) / (secim.raf - 1) / 10) : 0;
  const toplam = metalRafToplamGenislik(secim);

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_400px] lg:items-start lg:pb-0">
      <OnizlemeKutusu ipucu="Döndürmek için sürükle · Yakınlaştırmak için kaydır">
        <MetalRafSahne secim={secim} />
      </OnizlemeKutusu>

      <div className="space-y-4">
        <div className="card space-y-5 p-5">
          <Baslik no={1}>Ölçüler</Baslik>
          <SecenekDugmeleri etiket="Bölme genişliği" secenekler={S.genislikler} deger={secim.genislik} degistir={(v) => guncelle({ genislik: v })} />
          <SecenekDugmeleri etiket="Derinlik" secenekler={S.derinlikler} deger={secim.derinlik} degistir={(v) => guncelle({ derinlik: v })} />
          <OlcuAlani
            etiket="Yükseklik"
            deger={secim.yukseklik}
            min={S.yukseklik.min}
            max={S.yukseklik.max}
            adim={S.yukseklik.adim}
            degistir={(n) => guncelle({ yukseklik: n })}
          />
        </div>

        <div className="card space-y-4 p-5">
          <Baslik no={2}>Bölme ve raflar</Baslik>
          <Sayac
            baslik="Yan yana bölme"
            aciklama={`Toplam genişlik ${toplam} cm, ara dikmeler ortak`}
            deger={secim.bolme}
            min={1}
            max={S.maxBolme}
            degistir={(n) => guncelle({ bolme: n })}
          />
          <Sayac
            baslik="Bölme başına raf"
            aciklama={`Raf arası yaklaşık ${aralik} cm`}
            deger={secim.raf}
            min={S.minRaf}
            max={enCokRaf}
            degistir={(n) => guncelle({ raf: n })}
          />
        </div>

        <div className="card space-y-4 p-5">
          <Baslik no={3}>Raf malzemesi</Baslik>
          <SecenekDugmeleri<RafMalzeme>
            etiket="Raflar"
            secenekler={["sac", "ahsap"]}
            deger={secim.rafMalzeme}
            degistir={(v) => guncelle({ rafMalzeme: v })}
            yazi={(v) => (v === "sac" ? "Metal sac" : "Ahşap (18 mm)")}
          />
          {secim.rafMalzeme === "ahsap" && (
            <div>
              <div className="mb-2 text-xs font-semibold text-neutral-600">Ahşap raf rengi</div>
              <RenkSecici deger={secim.ahsapRenk} degistir={(v) => guncelle({ ahsapRenk: v })} />
            </div>
          )}
          <p className="text-xs text-neutral-500">
            {secim.rafMalzeme === "sac"
              ? "Kenarları bükülmüş sac raf, garaj, depo ve kiler için dayanıklı."
              : "Metal kiriş üstünde suntalam raf, ev ve ofis için daha sıcak görünüm."}
          </p>
        </div>

        <div className="card p-5">
          <Baslik no={4}>Metal rengi</Baslik>
          <MetalRenkSecici deger={secim.renk} degistir={(v) => guncelle({ renk: v })} />
          <p className="mt-3 text-xs text-neutral-500">Galvaniz dışındaki renkler elektrostatik toz boyalıdır.</p>
        </div>

        <FiyatAlani
          tur={"metal-raf"}
          sorgu={sorgu}
          fiyat={fiyat.fiyat}
          olcu={`${toplam}×${secim.derinlik}×${secim.yukseklik} cm`}
          not="Civatalı montaj, tüm civata ve plastik ayaklar kutudan çıkar."
        />
      </div>
    </div>
  );
}
