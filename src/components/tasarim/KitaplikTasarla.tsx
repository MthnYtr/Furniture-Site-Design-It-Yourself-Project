"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  KAPAK_TURLERI,
  SINIRLAR,
  enYuksek,
  fiyatHesapla,
  maxCekmece,
  maxRaf,
  modulleriYaz,
  rafAraligiCm,
  secimDuzelt,
  toplamGenislik,
  type KapakTuru,
  type KitaplikSecim,
  type Modul,
} from "@/lib/tasarim/kitaplik";
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

// 3D sahne sadece tarayıcıda çalışır (sunucuda WebGL yok)
const KitaplikSahne = dynamic(() => import("./KitaplikSahne"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">3D önizleme yükleniyor…</div>
  ),
});

// Kapak türü seçim kartlarındaki küçük çizimler
function KapakIkon({ tur }: { tur: KapakTuru }) {
  return (
    <svg viewBox="0 0 40 52" className="h-12 w-9" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="2" width="36" height="48" rx="1.5" />
      {tur === "yok" && <path d="M3 17h34M3 30h34M3 41h34" opacity="0.6" />}
      {tur === "tam" && (
        <>
          <rect x="4" y="4" width="32" height="44" fill="currentColor" opacity="0.15" stroke="none" />
          <path d="M31 22v8" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
      {tur === "alt" && (
        <>
          <path d="M3 13h34M3 24h34" opacity="0.6" />
          <rect x="4" y="27" width="32" height="21" fill="currentColor" opacity="0.15" stroke="none" />
          <path d="M3 26.5h34" />
          <path d="M31 31v5" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
      {tur === "cam" && (
        <>
          <rect x="7" y="7" width="26" height="38" fill="currentColor" opacity="0.07" />
          <path d="M12 14l8-5M12 22l14-9" opacity="0.5" />
          <path d="M31 22v8" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

const kucukDugme =
  "flex h-9 items-center gap-1.5 rounded-md border border-neutral-300 px-3 text-xs font-semibold transition-colors hover:border-brand-600 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-40";

export default function KitaplikTasarla({ baslangic }: { baslangic: KitaplikSecim }) {
  const [secim, setSecim] = useState<KitaplikSecim>(baslangic);
  const [secili, setSecili] = useState(0);
  const S = SINIRLAR;

  const aktif = Math.min(secili, secim.moduller.length - 1);
  const modul = secim.moduller[aktif];

  const guncelle = (yeni: Partial<KitaplikSecim>) => setSecim((s) => secimDuzelt({ ...s, ...yeni }));
  const modulGuncelle = (yeni: Partial<Modul>) =>
    setSecim((s) => secimDuzelt({ ...s, moduller: s.moduller.map((m, i) => (i === aktif ? { ...m, ...yeni } : m)) }));

  const modulEkle = () => {
    if (secim.moduller.length >= S.maxModul) return;
    // Yeni modül seçili modülün kopyası olarak sağına eklenir
    const yeni = [...secim.moduller];
    yeni.splice(aktif + 1, 0, { ...modul });
    guncelle({ moduller: yeni });
    setSecili(aktif + 1);
  };
  const modulSil = () => {
    if (secim.moduller.length <= 1) return;
    guncelle({ moduller: secim.moduller.filter((_, i) => i !== aktif) });
    setSecili(Math.max(0, aktif - 1));
  };
  const modulTasi = (yon: -1 | 1) => {
    const hedef = aktif + yon;
    if (hedef < 0 || hedef >= secim.moduller.length) return;
    const yeni = [...secim.moduller];
    [yeni[aktif], yeni[hedef]] = [yeni[hedef], yeni[aktif]];
    guncelle({ moduller: yeni });
    setSecili(hedef);
  };
  const yuksekligiTumuneUygula = () =>
    guncelle({ moduller: secim.moduller.map((m) => ({ ...m, yukseklik: modul.yukseklik })) });

  // Seçim adres çubuğuna yazılır: link kopyalanıp paylaşılabilir, sayfa yenilenince kaybolmaz
  // Tasarımın adres çubuğu yazımı: link paylaşımı ve sepete ekleme bunu kullanır
  const sorgu = useMemo(() => {
    const q = new URLSearchParams({
      d: String(secim.derinlik),
      renk: secim.renk,
      kr: secim.kapakRenk,
      kulp: secim.kulp,
      a: secim.arkalik ? "1" : "0",
      b: secim.baza ? "1" : "0",
      m: modulleriYaz(secim.moduller),
    });
    return q.toString();
  }, [secim]);
  useEffect(() => window.history.replaceState(null, "", `?${sorgu}`), [sorgu]);

  const fiyat = useMemo(() => fiyatHesapla(secim), [secim]);
  const enCokCekmece = maxCekmece(modul.yukseklik, secim.baza);
  const enCokRaf = maxRaf(modul.yukseklik, secim.baza, modul.cekmece);
  const genislik = toplamGenislik(secim);
  const onlukVar = secim.moduller.some((m) => m.kapak !== "yok" || m.cekmece > 0);
  const hepsiAyniBoy = secim.moduller.every((m) => m.yukseklik === modul.yukseklik);

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_400px] lg:items-start lg:pb-0">
      <OnizlemeKutusu
        ipucu={
          secim.moduller.length > 1
            ? "Düzenlemek için bir modüle tıkla · Döndürmek için sürükle"
            : "Döndürmek için sürükle · Yakınlaştırmak için kaydır"
        }
      >
        <KitaplikSahne secim={secim} seciliModul={aktif} modulSec={setSecili} />
      </OnizlemeKutusu>

      <div className="space-y-4">
        <div className="card p-5">
          <Baslik no={1}>Genel</Baslik>
          <div className="space-y-4">
            <SecenekDugmeleri
              etiket="Derinlik (tüm modüller)"
              secenekler={S.derinlikler}
              deger={secim.derinlik}
              degistir={(d) => guncelle({ derinlik: d })}
            />
            <div className="flex items-center justify-between rounded-md bg-brand-50 px-4 py-2.5 text-sm">
              <span className="text-neutral-600">Toplam ölçü</span>
              <span className="font-bold text-brand-900">
                {genislik} × {enYuksek(secim)} cm
              </span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <Baslik no={2}>Modüller</Baslik>

          <div className="mb-4 flex flex-wrap gap-2">
            {secim.moduller.map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSecili(i)}
                className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                  i === aktif ? "border-brand-700 bg-brand-700 text-white" : "border-neutral-300 hover:border-brand-600"
                }`}
              >
                <span className="block font-bold">Modül {i + 1}</span>
                <span className={i === aktif ? "text-white/80" : "text-neutral-500"}>
                  {m.genislik}×{m.yukseklik}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={modulEkle}
              disabled={secim.moduller.length >= S.maxModul}
              className="rounded-md border border-dashed border-brand-400 px-3 py-2 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-40"
            >
              + Modül ekle
            </button>
          </div>

          <div className="space-y-5 rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brand-900">Modül {aktif + 1} ayarları</span>
              <div className="flex gap-1.5">
                <button type="button" aria-label="Sola taşı" onClick={() => modulTasi(-1)} disabled={aktif === 0} className={kucukDugme}>
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Sağa taşı"
                  onClick={() => modulTasi(1)}
                  disabled={aktif === secim.moduller.length - 1}
                  className={kucukDugme}
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={modulSil}
                  disabled={secim.moduller.length <= 1}
                  className={`${kucukDugme} text-red-600 hover:border-red-500 hover:text-red-700`}
                >
                  Sil
                </button>
              </div>
            </div>

            <OlcuAlani
              etiket="Genişlik"
              deger={modul.genislik}
              min={S.modulGenislik.min}
              max={S.modulGenislik.max}
              adim={S.modulGenislik.adim}
              degistir={(n) => modulGuncelle({ genislik: n })}
            />

            <OlcuAlani
              etiket="Yükseklik"
              deger={modul.yukseklik}
              min={S.yukseklik.min}
              max={S.yukseklik.max}
              adim={S.yukseklik.adim}
              degistir={(n) => modulGuncelle({ yukseklik: n })}
              ek={
                secim.moduller.length > 1 && !hepsiAyniBoy ? (
                  <button
                    type="button"
                    onClick={yuksekligiTumuneUygula}
                    className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
                  >
                    Tümüne uygula
                  </button>
                ) : null
              }
            />

            <div>
              <div className="mb-2 text-xs font-semibold text-neutral-600">Kapak</div>
              <div className="grid grid-cols-4 gap-2">
                {KAPAK_TURLERI.map((k) => {
                  const sec = modul.kapak === k.kod;
                  return (
                    <button
                      key={k.kod}
                      type="button"
                      onClick={() => modulGuncelle({ kapak: k.kod })}
                      aria-pressed={sec}
                      title={k.aciklama}
                      className={`flex flex-col items-center gap-1 rounded-md border px-1 py-2.5 text-[11px] font-semibold transition-colors ${
                        sec
                          ? "border-brand-700 bg-brand-50 text-brand-800 ring-1 ring-brand-700"
                          : "border-neutral-300 text-neutral-600 hover:border-brand-600"
                      }`}
                    >
                      <KapakIkon tur={k.kod} />
                      {k.ad}
                    </button>
                  );
                })}
              </div>
              {modul.kapak !== "yok" && (
                <p className="mt-2 text-xs text-neutral-500">
                  {modul.genislik > S.ciftKapakGenislik ? "Çift kapak" : "Tek kapak"}, frenli menteşe.
                </p>
              )}
            </div>

            <Sayac
              baslik="Raf"
              aciklama={modul.raf > 0 ? `Raf arası yaklaşık ${rafAraligiCm(secim, modul)} cm` : "Raf yok"}
              deger={modul.raf}
              min={modul.kapak === "alt" ? 1 : 0}
              max={enCokRaf}
              degistir={(n) => modulGuncelle({ raf: n })}
            />

            <Sayac
              baslik="Çekmece"
              aciklama={enCokCekmece > 0 ? `Altta, en fazla ${enCokCekmece} adet` : "Bu yükseklikte sığmıyor"}
              deger={modul.cekmece}
              min={0}
              max={enCokCekmece}
              degistir={(n) => modulGuncelle({ cekmece: n })}
            />
          </div>
        </div>

        <div className="card space-y-5 p-5">
          <Baslik no={3}>Renk</Baslik>
          <div>
            <div className="mb-2 text-xs font-semibold text-neutral-600">Gövde ve raflar</div>
            <RenkSecici deger={secim.renk} degistir={(v) => guncelle({ renk: v })} />
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold text-neutral-600">Kapak ve çekmece önleri</div>
            <RenkSecici ayniSecenegi deger={secim.kapakRenk} degistir={(v) => guncelle({ kapakRenk: v })} />
            {!onlukVar && (
              <p className="mt-2 text-xs text-neutral-500">Bir modüle kapak veya çekmece eklediğinde görünür.</p>
            )}
          </div>
          <p className="text-xs text-neutral-500">18 mm suntalam, kenarlar PVC bantlı.</p>
        </div>

        <div className="card p-5">
          <Baslik no={4}>Kulp</Baslik>
          <KulpSecici deger={secim.kulp} degistir={(v) => guncelle({ kulp: v })} />
          {!onlukVar && <p className="mt-2 text-xs text-neutral-500">Kapak veya çekmece eklediğinde kullanılır.</p>}
        </div>

        <div className="card space-y-2.5 p-5">
          <Baslik no={5}>Detaylar</Baslik>
          <Anahtar acik={secim.arkalik} degistir={(v) => guncelle({ arkalik: v })} baslik="Arkalık" aciklama="3 mm HDF, kitaplığı sağlamlaştırır" />
          <Anahtar acik={secim.baza} degistir={(v) => guncelle({ baza: v })} baslik="Baza" aciklama="Altta 6 cm kapalı süpürgelik" />
        </div>

        <FiyatAlani
          tur={"kitaplik"}
          sorgu={sorgu}
          fiyat={fiyat.fiyat}
          olcu={`${genislik}×${enYuksek(secim)}×${secim.derinlik} cm`}
          not="Ölçüler dış ölçüdür. Her modül ayrı gövdedir, yerinde yan yana vidalanır."
        />
      </div>
    </div>
  );
}
