import Link from "next/link";

type Props = {
  slug: string;
  name: string;
  basePrice: number;
  salePrice: number | null;
  category: string;
  image?: string | null;
  soldOut?: boolean;
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
}: Props) {
  const indirim = salePrice ? Math.round((1 - salePrice / basePrice) * 100) : 0;

  return (
    <Link href={`/urun/${slug}`} className="group block">
      <div className="relative flex aspect-5/3 items-center justify-center overflow-hidden bg-neutral-100 text-xs text-neutral-400 md:aspect-4/3 md:text-sm">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          "Görsel yakında"
        )}
        {indirim > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900 md:left-2 md:top-2 md:px-2.5 md:py-1 md:text-xs">
            %{indirim} İndirim
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-neutral-800/80 py-1 text-center text-[10px] font-bold tracking-widest text-white md:text-xs">
            TÜKENDİ
          </span>
        )}
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-wide text-neutral-500 md:text-[11px]">
        {category}
      </p>
      <h3 className="text-xs font-medium group-hover:text-teal-700 md:text-sm">{name}</h3>
      <div className="mt-1 text-xs md:text-sm">
        {salePrice ? (
          <>
            <span className="mr-2 text-neutral-400 line-through">{tl(basePrice)}</span>
            <span className="font-bold text-red-600">{tl(salePrice)}</span>
          </>
        ) : (
          <span className="font-bold">{tl(basePrice)}</span>
        )}
      </div>
    </Link>
  );
}