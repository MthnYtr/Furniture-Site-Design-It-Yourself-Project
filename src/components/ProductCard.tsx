import Link from "next/link";

type Props = {
  slug: string;
  name: string;
  basePrice: number;
  salePrice: number | null;
  category: string;
  image?: string | null;
  soldOut?: boolean;
  baslayan?: boolean;
};

const tl = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";

export default function ProductCard({
  slug,
  name,
  basePrice,
  salePrice,
  category,
  image,
  soldOut,
  baslayan,
}: Props) {
  const indirim = salePrice ? Math.round((1 - salePrice / basePrice) * 100) : 0;

  return (
    <Link
      href={`/urun/${slug}`}
      className="group block overflow-hidden rounded-lg border border-neutral-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg"
    >
      <div className="relative flex aspect-5/3 items-center justify-center overflow-hidden bg-neutral-100 text-xs text-neutral-400 md:aspect-4/3 md:text-sm">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              soldOut ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          "Görsel yakında"
        )}

        {indirim > 0 && !soldOut && (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm md:left-3 md:top-3 md:px-2.5 md:py-1 md:text-xs">
            %{indirim} İNDİRİM
          </span>
        )}

        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-neutral-900/80 py-1.5 text-center text-[10px] font-bold tracking-widest text-white md:text-xs">
            TÜKENDİ
          </span>
        )}
      </div>

      <div className="p-3 md:p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 md:text-[11px]">
          {category}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-8 text-xs font-semibold leading-4 text-neutral-800 transition-colors group-hover:text-brand-700 md:min-h-10 md:text-sm md:leading-5">
          {name}
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm md:mt-3">
          {baslayan && (
            <span className="text-[10px] font-medium text-neutral-500 md:text-xs">başlayan</span>
          )}
          {salePrice ? (
            <>
              <span className="text-base font-bold text-red-600 md:text-lg">{tl(salePrice)}</span>
              <span className="text-xs text-neutral-400 line-through">{tl(basePrice)}</span>
            </>
          ) : (
            <span className="text-base font-bold text-neutral-900 md:text-lg">{tl(basePrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}