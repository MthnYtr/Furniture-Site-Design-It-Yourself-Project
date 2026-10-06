import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import FiltreKutusu from "@/components/FiltreKutusu";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const k = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, image: true },
  });
  if (!k) return { title: "Kategori bulunamadı" };

  const aciklama = `${k.name} modelleri ve fiyatları. Hızlı teslimat, kurulum hizmeti ve 2 yıl garanti ile güvenle alışveriş yap.`;

  return {
    title: k.name,
    description: aciklama,
    alternates: { canonical: `/kategori/${slug}` },
    openGraph: {
      title: k.name,
      description: aciklama,
      url: `/kategori/${slug}`,
      type: "website",
      ...(k.image ? { images: [{ url: k.image, alt: k.name }] } : {}),
    },
  };
}

const SIRALAMALAR = [
  { deger: "yeni", ad: "En yeniler" },
  { deger: "artan", ad: "Fiyat: Düşükten yükseğe" },
  { deger: "azalan", ad: "Fiyat: Yüksekten düşüğe" },
] as const;

function sayiOku(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default async function KategoriSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sirala?: string;
    indirimli?: string;
    stok?: string;
    min?: string;
    max?: string;
  }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const sirala = SIRALAMALAR.some((s) => s.deger === sp.sirala) ? sp.sirala! : "yeni";
  const sadeceIndirimli = sp.indirimli === "1";
  const sadeceStok = sp.stok === "1";
  const min = sayiOku(sp.min);
  const max = sayiOku(sp.max);
  const filtreVar = sadeceIndirimli || sadeceStok || min !== undefined || max !== undefined;

  const aralik = {
    ...(min !== undefined ? { gte: min } : {}),
    ...(max !== undefined ? { lte: max } : {}),
  };

  const kategori = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: {
          isActive: true,
          ...(sadeceIndirimli ? { salePrice: { not: null } } : {}),
          ...(sadeceStok ? { stock: { gt: 0 } } : {}),
          ...(min !== undefined || max !== undefined
            ? {
                OR: [
                  { salePrice: { not: null, ...aralik } },
                  { salePrice: null, basePrice: aralik },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          _count: { select: { variants: true } },
        },
      },
    },
  });

  if (!kategori) notFound();

  const etkinFiyat = (u: (typeof kategori.products)[number]) =>
    Number(u.salePrice ?? u.basePrice);

  const urunler = [...kategori.products];
  if (sirala === "artan") urunler.sort((a, b) => etkinFiyat(a) - etkinFiyat(b));
  if (sirala === "azalan") urunler.sort((a, b) => etkinFiyat(b) - etkinFiyat(a));

  return (
    <main className="mx-auto max-w-330 px-4 py-6 md:py-10">
      <nav className="mb-5 text-xs text-neutral-500">
        <Link href="/" className="transition-colors hover:text-brand-700">Ana sayfa</Link>
        <span className="mx-2">&gt;</span>
        <span className="font-semibold text-neutral-800">{kategori.name}</span>
      </nav>

      {kategori.image ? (
        <div className="relative mb-8 overflow-hidden rounded-lg bg-neutral-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={kategori.image} alt={kategori.name} className="h-40 w-full object-cover md:h-60" />
          <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/70 via-black/20 to-transparent p-5 md:p-8">
            <div>
              <h1 className="text-2xl font-bold text-white md:text-4xl">{kategori.name}</h1>
              <p className="mt-1 text-sm text-white/80">{urunler.length} ürün</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <h1 className="text-2xl font-bold md:text-4xl">{kategori.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">{urunler.length} ürün</p>
        </div>
      )}

      <FiltreKutusu
        yol={`/kategori/${kategori.slug}`}
        siralamalar={SIRALAMALAR}
        sirala={sirala}
        indirimliSecenegi
        indirimli={sadeceIndirimli}
        stok={sadeceStok}
        min={min}
        max={max}
      />

      {urunler.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-16 text-center">
          <p className="mb-4 text-neutral-600">
            {filtreVar
              ? "Bu filtrelere uygun ürün bulunamadı."
              : "Bu kategoride henüz ürün yok."}
          </p>
          {filtreVar && (
            <Link href={`/kategori/${kategori.slug}`} className="btn btn-primary">
              Filtreleri temizle
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {urunler.map((u) => (
            <ProductCard
              key={u.id}
              slug={u.slug}
              name={u.name}
              basePrice={Number(u.basePrice)}
              salePrice={u.salePrice ? Number(u.salePrice) : null}
              category={kategori.name}
              image={u.images[0]?.url ?? null}
              soldOut={u.stock <= 0}
              baslayan={u._count.variants > 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}