"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  ALT_SECENEKLERI,
  DOLAP_OLCULERI,
  KOSE_TURLERI,
  MAX_MODUL,
  UST_SECENEKLERI,
  dolapDuzelt,
  dolapFiyat,
  dolapOlcuMetni,
  dolapYukseklik,
  lMi,
  siraYaz,
  type AltTur,
  type DolapSecim,
  type Duvar,
  type KoseTuru,
  type KoseYonu,
  type Sekil,
  type Sira,
  type UstTur,
} from "@/lib/tasarim/dolap";
import type { Secili } from "./DolapSahne";
import { TEZGAH_RENKLERI, type TezgahKodu } from "@/lib/tasarim/fiyatlar";
import { Anahtar, Baslik, FiyatAlani, KulpSecici, OlcuAlani, OnizlemeKutusu, RenkSecici, SecenekDugmeleri } from "./ortakUi";

const DolapSahne = dynamic(() => import("./DolapSahne"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">3D önizleme yükleniyor…</div>
  ),
});

// Alt ve üst dolap türleri için küçük çizimler
function TurIkon({ kod, sira }: { kod: AltTur | UstTur; sira: Sira }) {
  const c = "currentColor";
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
      {kod === "boy" ? <rect x="10" y="2" width="20" height="36" rx="1" /> : <rect x="4" y="8" width="32" height="26" rx="1" />}
      {kod === "kapak" && <path d="M20 8v26M16 13v4M24 13v4" />}
      {kod === "cekmece" && <path d="M4 17h32M4 26h32M16 12.5h8M16 21.5h8M16 30h8" />}
      {kod === "evye" && (
        <>
          <path d="M20 8v26" />
          <rect x="9" y="4" width="22" height="3" fill={c} opacity="0.35" stroke="none" />
          <path d="M20 4V1" />
        </>
      )}
      {kod === "ocak" && (
        <>
          <path d="M4 21h32M16 14h8M16 27h8" />
          <circle cx="13" cy="4.5" r="2" />
          <circle cx="27" cy="4.5" r="2" />
        </>
      )}
      {kod === "bosluk" && sira === "alt" && (
        <>
          <rect x="6" y="10" width="28" height="22" fill={c} opacity="0.12" stroke="none" />
          <path d="M12 14h16" />
        </>
      )}
      {kod === "boy" && <path d="M10 22h20M26 18v-3M26 26v3" />}
      {kod === "lavabo" && (
        <>
          <path d="M20 8v26" />
          <path d="M6 8c0-3 28-3 28 0" />
        </>
      )}
      {kod === "acik" && <path d="M4 21h32" opacity="0.6" />}
      {kod === "cam" && (
        <>
          <rect x="8" y="12" width="24" height="18" fill={c} opacity="0.08" />
          <path d="M12 18l6-4" opacity="0.5" />
        </>
      )}
      {kod === "ayna" && (
        <>
          <rect x="8" y="11" width="24" height="20" fill="#cfdde3" stroke="none" />
          <path d="M12 18l6-4M14 24l10-7" stroke="#ffffff" />
        </>
      )}
      {kod === "bosluk" && sira === "ust" && <path d="M10 13l20 16M30 13L10 29" opacity="0.35" />}
    </svg>
  );
}

function TurKartlari<T extends AltTur | UstTur>({
  sira,
  secenekler,
  deger,
  degistir,
}: {
  sira: Sira;
  secenekler: { kod: T; ad: string; aciklama: string }[];
  deger: T;
  degistir: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {secenekler.map((k) => {
        const sec = deger === k.kod;
        return (
          <button
            key={k.kod}
            type="button"
            onClick={() => degistir(k.kod)}
            aria-pressed={sec}
            title={k.aciklama}
            className={`flex flex-col items-center gap-0.5 rounded-md border px-1 py-2 text-[11px] font-semibold transition-colors ${
              sec ? "border-brand-700 bg-brand-50 text-brand-800 ring-1 ring-brand-700" : "border-neutral-300 text-neutral-600 hover:border-brand-600"
            }`}
          >
            <TurIkon kod={k.kod} sira={sira} />
            {k.ad}
            <span className="text-[10px] font-normal text-neutral-500">{k.aciklama}</span>
          </button>
        );
      })}
    </div>
  );
}

function TezgahSecici({ deger, degistir }: { deger: TezgahKodu; degistir: (v: TezgahKodu) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {(Object.keys(TEZGAH_RENKLERI) as TezgahKodu[]).map((k) => {
        const r = TEZGAH_RENKLERI[k];
        const sec = deger === k;
        return (
          <button key={k} type="button" onClick={() => degistir(k)} aria-pressed={sec} className="group flex flex-col items-center gap-1.5">
            <span
              className={`h-10 w-full rounded-md border-2 transition ${sec ? "border-brand-700 ring-2 ring-brand-700/25" : "border-neutral-200 group-hover:border-brand-300"}`}
              style={{
                background: r.damar
                  ? `linear-gradient(115deg, ${r.renk} 0 35%, ${r.damar} 36%, ${r.renk} 40% 70%, ${r.damar} 71%, ${r.renk} 74%)`
                  : r.renk,
              }}
            />
            <span className={`text-center text-[11px] leading-tight ${sec ? "font-bold text-brand-900" : "text-neutral-600"}`}>{r.ad}</span>
          </button>
        );
      })}
    </div>
  );
}

const kucukDugme =
  "flex h-9 items-center gap-1.5 rounded-md border border-neutral-300 px-3 text-xs font-semibold transition-colors hover:border-brand-600 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-40";

// Hangi duvarın hangi sırası, seçimdeki hangi alana karşılık gelir
const ALAN = {
  ana: { alt: "altlar", ust: "ustler" },
  yan: { alt: "yanAltlar", ust: "yanUstler" },
} as const;

function KoseIkon({ tur }: { tur: KoseTuru }) {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h32v14H18v18H4z" fill="currentColor" opacity="0.08" />
      <path d="M4 4h32v14H18v18H4z" />
      {tur === "unite" ? (
        <path d="M18 18h18M18 18v18" strokeWidth="2.5" />
      ) : (
        <>
          <path d="M18 18h18" strokeWidth="2.5" />
          <path d="M4 18h14" strokeDasharray="2 2" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

export default function DolapTasarla({ baslangic }: { baslangic: DolapSecim }) {
  const [secim, setSecim] = useState<DolapSecim>(baslangic);
  const [secili, setSecili] = useState<Secili>({ duvar: "ana", sira: "alt", i: 0 });
  const tur = secim.tur;
  const O = DOLAP_OLCULERI[tur];
  const L = lMi(secim);

  // Köşe seçiliyken panel en son bakılan duvar/sırayı göstermeye devam eder
  const [sonSecim, setSonSecim] = useState<{ duvar: Duvar; sira: Sira }>({ duvar: "ana", sira: "alt" });
  const koseSecili = secili.duvar === "kose";
  const duvar: Duvar = secili.duvar === "kose" ? sonSecim.duvar : L ? secili.duvar : "ana";
  const sira: Sira = secili.duvar === "kose" ? sonSecim.sira : secili.sira;
  const alan = ALAN[duvar][sira];
  const liste = secim[alan] as { genislik: number; tur: string }[];
  const aktif = secili.duvar === "kose" ? -1 : Math.min(secili.i, Math.max(0, liste.length - 1));
  const modul = aktif >= 0 ? liste[aktif] : undefined;
  const enAz = duvar === "ana" && sira === "alt" ? 1 : 0;

  const sec = (yeni: Secili) => {
    setSecili(yeni);
    if (yeni.duvar !== "kose") setSonSecim({ duvar: yeni.duvar, sira: yeni.sira });
  };
  const guncelle = (yeni: Partial<DolapSecim>) => setSecim((s) => dolapDuzelt({ ...s, ...yeni }, s.tur));
  const listeGuncelle = (yeni: { genislik: number; tur: string }[]) => guncelle({ [alan]: yeni } as Partial<DolapSecim>);
  const modulGuncelle = (yeni: Partial<{ genislik: number; tur: string }>) =>
    listeGuncelle(liste.map((m, i) => (i === aktif ? { ...m, ...yeni } : m)));

  const modulEkle = () => {
    if (liste.length >= MAX_MODUL) return;
    const yeni = [...liste];
    // Yeni dolap seçilinin kopyası olarak sağına eklenir (liste boşsa varsayılan)
    const kopya = modul
      ? { ...modul }
      : { genislik: 60, tur: sira === "alt" ? ALT_SECENEKLERI[tur][0].kod : UST_SECENEKLERI[tur][0].kod };
    const yer = modul ? aktif + 1 : liste.length;
    yeni.splice(yer, 0, kopya);
    listeGuncelle(yeni);
    sec({ duvar, sira, i: yer });
  };
  const modulSil = () => {
    if (liste.length <= enAz) return;
    listeGuncelle(liste.filter((_, i) => i !== aktif));
    sec({ duvar, sira, i: Math.max(0, aktif - 1) });
  };
  const modulTasi = (yon: -1 | 1) => {
    const hedef = aktif + yon;
    if (hedef < 0 || hedef >= liste.length) return;
    const yeni = [...liste];
    [yeni[aktif], yeni[hedef]] = [yeni[hedef], yeni[aktif]];
    listeGuncelle(yeni);
    sec({ duvar, sira, i: hedef });
  };

  // Tasarımın adres çubuğu yazımı: link paylaşımı ve sepete ekleme bunu kullanır
  const sorgu = useMemo(() => {
    const q = new URLSearchParams({
      renk: secim.renk,
      kr: secim.kapakRenk,
      kulp: secim.kulp,
      a: siraYaz(secim.altlar),
      u: siraYaz(secim.ustler),
      ...(tur === "mutfak"
        ? {
            tz: secim.tezgah,
            sk: secim.sekil,
            ...(secim.sekil === "L"
              ? {
                  ko: secim.kose,
                  kt: secim.koseTur,
                  ku: secim.koseUst ? "1" : "0",
                  ya: siraYaz(secim.yanAltlar),
                  yu: siraYaz(secim.yanUstler),
                }
              : {}),
          }
        : { asma: secim.asma ? "1" : "0" }),
    });
    return q.toString();
  }, [secim, tur]);
  useEffect(() => window.history.replaceState(null, "", `?${sorgu}`), [sorgu]);

  const fiyat = useMemo(() => dolapFiyat(secim), [secim]);
  const olcu = dolapOlcuMetni(secim);
  const yukseklik = Math.round(dolapYukseklik(secim) / 10);
  const secenekler = sira === "alt" ? ALT_SECENEKLERI[tur] : UST_SECENEKLERI[tur];
  const turAdi = (k: string) => secenekler.find((x) => x.kod === k)?.ad;
  const minGenislik = Math.max(
    O.genislik.min,
    sira === "alt" ? (ALT_SECENEKLERI[tur].find((x) => x.kod === modul?.tur)?.minGenislik ?? 0) : 0,
  );
  const siraAdi = sira === "alt" ? "Alt" : "Üst";
  const sayilar = {
    alt: (secim[ALAN[duvar].alt] as unknown[]).length,
    ust: (secim[ALAN[duvar].ust] as unknown[]).length,
  };

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_400px] lg:items-start lg:pb-0">
      <OnizlemeKutusu ipucu="Düzenlemek için bir dolaba tıkla · Döndürmek için sürükle">
        <DolapSahne secim={secim} secili={koseSecili ? { duvar: "kose" } : { duvar, sira, i: aktif }} sec={sec} />
      </OnizlemeKutusu>

      <div className="space-y-4">
        <div className="card space-y-4 p-5">
          <Baslik no={1}>Genel</Baslik>
          {tur === "banyo" && (
            <SecenekDugmeleri<"asma" | "ayakli">
              etiket="Montaj"
              secenekler={["asma", "ayakli"]}
              deger={secim.asma ? "asma" : "ayakli"}
              degistir={(v) => guncelle({ asma: v === "asma" })}
              yazi={(v) => (v === "asma" ? "Duvara asma" : "Ayaklı")}
            />
          )}
          {tur === "mutfak" && (
            <>
              <SecenekDugmeleri<Sekil>
                etiket="Mutfak şekli"
                secenekler={["duz", "L"]}
                deger={secim.sekil}
                degistir={(v) => {
                  guncelle({ sekil: v });
                  sec({ duvar: "ana", sira: "alt", i: 0 });
                }}
                yazi={(v) => (v === "duz" ? "Düz (tek duvar)" : "L (iki duvar)")}
              />
              {L && (
                <div
                  className={`space-y-4 rounded-lg border p-4 transition-colors ${koseSecili ? "border-brand-600 bg-brand-50/50" : "border-neutral-200"}`}
                >
                  <div className="text-sm font-bold text-brand-900">Köşe</div>
                  <SecenekDugmeleri<KoseYonu>
                    etiket="Köşe hangi tarafta?"
                    secenekler={["sol", "sag"]}
                    deger={secim.kose}
                    degistir={(v) => guncelle({ kose: v })}
                    yazi={(v) => (v === "sol" ? "Solda" : "Sağda")}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {KOSE_TURLERI.map((k) => {
                      const secili2 = secim.koseTur === k.kod;
                      return (
                        <button
                          key={k.kod}
                          type="button"
                          onClick={() => guncelle({ koseTur: k.kod })}
                          aria-pressed={secili2}
                          className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2.5 text-center text-[11px] font-semibold transition-colors ${
                            secili2
                              ? "border-brand-700 bg-brand-50 text-brand-800 ring-1 ring-brand-700"
                              : "border-neutral-300 text-neutral-600 hover:border-brand-600"
                          }`}
                        >
                          <KoseIkon tur={k.kod} />
                          {k.ad}
                          <span className="text-[10px] font-normal text-neutral-500">{k.aciklama}</span>
                        </button>
                      );
                    })}
                  </div>
                  <Anahtar
                    acik={secim.koseUst}
                    degistir={(v) => guncelle({ koseUst: v })}
                    baslik="Köşe üst dolabı"
                    aciklama="Köşeye 60×60 cm L üst dolap"
                  />
                </div>
              )}
            </>
          )}
          <div className="flex items-center justify-between rounded-md bg-brand-50 px-4 py-2.5 text-sm">
            <span className="text-neutral-600">Toplam ölçü</span>
            <span className="text-right font-bold text-brand-900">
              {olcu} · {yukseklik} cm yükseklik
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            {tur === "mutfak"
              ? `Alt dolap derinliği ${O.altD / 10} cm, tezgah ${O.tezgahD / 10} cm, tezgah yüksekliği ${(O.baza + O.altH + O.tezgahK) / 10} cm. Üst dolaplar ${O.ustD / 10} cm derin.`
              : `Alt dolap derinliği ${O.altD / 10} cm, yüksekliği ${O.altH / 10} cm. Neme dayanıklı levha kullanılır.`}
          </p>
        </div>

        <div className="card p-5">
          <Baslik no={2}>Dolaplar</Baslik>

          {L && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              {(["ana", "yan"] as Duvar[]).map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => sec({ duvar: x, sira: "alt", i: 0 })}
                  aria-pressed={duvar === x}
                  className={`rounded-md border py-2 text-sm font-bold transition-colors ${
                    duvar === x ? "border-brand-700 bg-brand-700 text-white" : "border-neutral-300 hover:border-brand-600"
                  }`}
                >
                  {x === "ana" ? "Ana duvar" : "Yan duvar"}
                </button>
              ))}
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1">
            {(["alt", "ust"] as Sira[]).map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => sec({ duvar, sira: x, i: 0 })}
                aria-pressed={sira === x}
                className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                  sira === x ? "bg-white text-brand-900 shadow-sm" : "text-neutral-600 hover:text-brand-700"
                }`}
              >
                {x === "alt" ? "Alt dolaplar" : "Üst dolaplar"} ({sayilar[x]})
              </button>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {liste.map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sec({ duvar, sira, i })}
                className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                  i === aktif ? "border-brand-700 bg-brand-700 text-white" : "border-neutral-300 hover:border-brand-600"
                }`}
              >
                <span className="block font-bold">
                  {siraAdi} {i + 1}
                </span>
                <span className={i === aktif ? "text-white/80" : "text-neutral-500"}>
                  {m.genislik} cm · {turAdi(m.tur)}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={modulEkle}
              disabled={liste.length >= MAX_MODUL}
              className="rounded-md border border-dashed border-brand-400 px-3 py-2 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-40"
            >
              + {siraAdi} dolap ekle
            </button>
          </div>

          {koseSecili ? (
            <p className="rounded-lg border border-brand-300 bg-brand-50 p-4 text-sm text-brand-900">
              Köşe modülü seçili. Türünü ve üst dolabını yukarıdaki &quot;Köşe&quot; bölümünden değiştirebilirsin.
            </p>
          ) : modul ? (
            <div className="space-y-5 rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand-900">
                  {L ? (duvar === "ana" ? "Ana duvar · " : "Yan duvar · ") : ""}
                  {siraAdi} dolap {aktif + 1}
                </span>
                <div className="flex gap-1.5">
                  <button type="button" aria-label="Önceye al" onClick={() => modulTasi(-1)} disabled={aktif === 0} className={kucukDugme}>
                    ←
                  </button>
                  <button type="button" aria-label="Sonraya al" onClick={() => modulTasi(1)} disabled={aktif === liste.length - 1} className={kucukDugme}>
                    →
                  </button>
                  <button
                    type="button"
                    onClick={modulSil}
                    disabled={liste.length <= enAz}
                    className={`${kucukDugme} text-red-600 hover:border-red-500 hover:text-red-700`}
                  >
                    Sil
                  </button>
                </div>
              </div>

              <OlcuAlani
                etiket="Genişlik"
                deger={modul.genislik}
                min={minGenislik}
                max={O.genislik.max}
                adim={O.genislik.adim}
                degistir={(n) => modulGuncelle({ genislik: n })}
              />

              <div>
                <div className="mb-2 text-xs font-semibold text-neutral-600">Tür</div>
                <TurKartlari<AltTur | UstTur>
                  sira={sira}
                  secenekler={secenekler}
                  deger={modul.tur as AltTur | UstTur}
                  degistir={(v) => modulGuncelle({ tur: v })}
                />
              </div>
              <p className="text-xs text-neutral-500">
                {L
                  ? "Dolaplar köşeden başlayarak dışarı doğru sıralanır. "
                  : ""}
                {sira === "ust"
                  ? "Boy dolabın önüne denk gelen üst dolap otomatik yanına kayar. Araya boşluk için \"Boş duvar\" ekleyebilirsin."
                  : ""}
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
              Bu sırada dolap yok. Eklemek için &quot;+ {siraAdi} dolap ekle&quot;ye bas.
            </p>
          )}
        </div>

        <div className="card space-y-5 p-5">
          <Baslik no={3}>Renk</Baslik>
          <div>
            <div className="mb-2 text-xs font-semibold text-neutral-600">Gövde</div>
            <RenkSecici deger={secim.renk} degistir={(v) => guncelle({ renk: v })} />
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold text-neutral-600">Kapak ve çekmece önleri</div>
            <RenkSecici ayniSecenegi deger={secim.kapakRenk} degistir={(v) => guncelle({ kapakRenk: v })} />
          </div>
          {tur === "mutfak" && (
            <div>
              <div className="mb-2 text-xs font-semibold text-neutral-600">Tezgah (38 mm laminat)</div>
              <TezgahSecici deger={secim.tezgah} degistir={(v) => guncelle({ tezgah: v })} />
            </div>
          )}
        </div>

        <div className="card p-5">
          <Baslik no={4}>Kulp</Baslik>
          <KulpSecici deger={secim.kulp} degistir={(v) => guncelle({ kulp: v })} />
        </div>

        <FiyatAlani
          tur={tur}
          sorgu={sorgu}
          fiyat={fiyat.fiyat}
          olcu={olcu}
          not={
            tur === "mutfak"
              ? "Tezgah dahildir. Evye, ocak, batarya ve beyaz eşya fiyata dahil değildir, görseller örnektir."
              : "Seramik lavabo dahildir. Batarya ve sifon dahil değildir."
          }
        />
      </div>
    </div>
  );
}
