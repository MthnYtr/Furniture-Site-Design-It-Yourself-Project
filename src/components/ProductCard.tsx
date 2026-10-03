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

export default function ProductCard({ slug, name, basePrice, salePrice, category, image, soldOut }: Props) {
  const indirim = salePrice ? Math.round((1 - salePrice / basePrice) * 100) : 0;

  return (
    <Link href={`/urun/${slug}`} className="group block">
      <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden bg-neutral-100 text-sm text-neutral-400">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          "Görsel yakında"
        )}
        {indirim > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900">
            %{indirim} İndirim
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-neutral-800/80 py-1 text-center text-xs font-bold tracking-widest text-white">
            TÜKENDİ
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-neutral-500">{category}</p>
      <h3 className="text-sm font-medium group-hover:text-teal-700">{name}</h3>
      <div className="mt-1 text-sm">
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