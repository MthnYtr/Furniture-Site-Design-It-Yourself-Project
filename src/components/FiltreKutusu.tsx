import Link from "next/link";

type Siralama = { deger: string; ad: string };

type Props = {
  yol: string;
  siralamalar: readonly Siralama[];
  sirala: string;
  indirimliSecenegi?: boolean;
  indirimli: boolean;
  stok: boolean;
  min?: number;
  max?: number;
};

export default function FiltreKutusu({
  yol,
  siralamalar,
  sirala,
  indirimliSecenegi = false,
  indirimli,
  stok,
  min,
  max,
}: Props) {
  const filtreSayisi =
    (indirimli ? 1 : 0) + (stok ? 1 : 0) + (min !== undefined ? 1 : 0) + (max !== undefined ? 1 : 0);
  const degisik = filtreSayisi > 0 || sirala !== "yeni";

  // Belirtilen parametreler hariç, mevcut seçimlerle bir adres üretir
  const href = (cikar: string[]) => {
    const q = new URLSearchParams();
    if (sirala !== "yeni" && !cikar.includes("sirala")) q.set("sirala", sirala);
    if (indirimli && !cikar.includes("indirimli")) q.set("indirimli", "1");
    if (stok && !cikar.includes("stok")) q.set("stok", "1");
    if (min !== undefined && !cikar.includes("min")) q.set("min", String(min));
    if (max !== undefined && !cikar.includes("max")) q.set("max", String(max));
    const s = q.toString();
    return s ? `${yol}?${s}` : yol;
  };

  const etiketler: { ad: string; kaldir: string }[] = [];
  if (indirimli) etiketler.push({ ad: "Sadece indirimli", kaldir: "indirimli" });
  if (stok) etiketler.push({ ad: "Sadece stokta olanlar", kaldir: "stok" });
  if (min !== undefined) etiketler.push({ ad: `En az ${min} TL`, kaldir: "min" });
  if (max !== undefined) etiketler.push({ ad: `En çok ${max} TL`, kaldir: "max" });

  const etiket = "block text-xs font-semibold text-neutral-600";

  return (
    <div className="mb-8">
      <details className="group rounded-lg border border-neutral-200 bg-white" open={filtreSayisi > 0}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filtrele ve sırala
            {filtreSayisi > 0 && (
              <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">
                {filtreSayisi}
              </span>
            )}
          </span>
          <span className="text-lg group-open:hidden">+</span>
          <span className="hidden text-lg group-open:inline">−</span>
        </summary>

        <form
          method="get"
          action={yol}
          className="grid gap-4 border-t border-neutral-200 p-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end"
        >
          <label className={etiket}>
            Sıralama
            <select name="sirala" defaultValue={sirala} className="input mt-1">
              {siralamalar.map((s) => (
                <option key={s.deger} value={s.deger}>
                  {s.ad}
                </option>
              ))}
            </select>
          </label>

          <label className={etiket}>
            En az fiyat (TL)
            <input
              name="min"
              type="number"
              min="0"
              inputMode="numeric"
              defaultValue={min ?? ""}
              placeholder="0"
              className="input mt-1"
            />
          </label>

          <label className={etiket}>
            En çok fiyat (TL)
            <input
              name="max"
              type="number"
              min="0"
              inputMode="numeric"
              defaultValue={max ?? ""}
              placeholder="Sınırsız"
              className="input mt-1"
            />
          </label>

          <div className="flex gap-2 md:col-start-4 md:row-span-2 md:row-start-1 md:flex-col">
            <button className="btn btn-primary flex-1 py-2.5">UYGULA</button>
            {degisik && (
              <Link href={yol} className="btn btn-outline flex-1 py-2.5">
                Temizle
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:col-span-3">
            {indirimliSecenegi && (
              <label className="flex items-center gap-2">
                <input type="checkbox" name="indirimli" value="1" defaultChecked={indirimli} className="accent-brand-700" />
                Sadece indirimli ürünler
              </label>
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" name="stok" value="1" defaultChecked={stok} className="accent-brand-700" />
              Sadece stokta olanlar
            </label>
          </div>
        </form>
      </details>

      {etiketler.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {etiketler.map((e) => (
            <Link
              key={e.kaldir}
              href={href([e.kaldir])}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-100"
            >
              {e.ad}
              <span aria-hidden className="text-sm leading-none">×</span>
              <span className="sr-only">kaldır</span>
            </Link>
          ))}
          <Link href={yol} className="px-2 text-xs font-semibold text-neutral-500 underline hover:text-brand-700">
            Tümünü temizle
          </Link>
        </div>
      )}
    </div>
  );
}