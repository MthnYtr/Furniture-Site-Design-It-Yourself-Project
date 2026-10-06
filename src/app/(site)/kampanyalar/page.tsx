import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import FiltreKutusu from "@/components/FiltreKutusu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kampanyalar",
  description: "İndirimli raf, kitaplık, çalışma masası ve dolap fırsatları.",
  alternates: { canonical: "/kampanyalar" },
};

const SIRALAMALAR = [
  { deger: "yeni", ad: "En yeniler" },
  { deger: "artan", ad: "Fiyat: Düşükten yükseğe" },
  { deger: "azalan", ad: "Fiyat: Yüksekten düşüğe" },
  { deger: "indirim", ad: "En yüksek indirim" },
] as const;

function sayiOku(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default async function Kampanyalar({
  searchParams,
}: {
  searchParams: Promise<{
    sirala?: string;
    stok?: string;
    min?: string;
    max?: string;
  }>;
}) {
  const sp = await searchParams;

  const sirala = SIRALAMALAR.some((s) => s.deger === sp.sirala) ? sp.sirala! : "yeni";
  const sadeceStok = sp.stok === "1";
  const min = sayiOku(sp.min);
  const max = sayiOku(sp.max);
  const filtreVar = sadeceStok || min !== undefined || max !== undefined;

  const aralik = {
    ...(min !== undefined ? { gte: min } : {}),
    ...(max !== undefined ? { lte: max } : {}),
  };

  const urunler = await prisma.product.findMany({
    where: {
      isActive: true,
      salePrice: {
        not: null,
        ...(min !== undefined || max !== undefined ? aralik : {}),
      },
      ...(sadeceStok ? { stock: { gt: 0 } } : {}),
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const fiyat = (u: (typeof urunler)[number]) => Number(u.salePrice ?? u.basePrice);
  const indirimOrani = (u: (typeof urunler)[number]) =>
    1 - Number(u.salePrice ?? u.basePrice) / Number(u.basePrice);

  if (sirala === "artan") urunler.sort((a, b) => fiyat(a) - fiyat(b));
  if (sirala === "azalan") urunler.sort((a, b) => fiyat(b) - fiyat(a));
  if (sirala === "indirim") urunler.sort((a, b) => indirimOrani(b) - indirimOrani(a));

  return (
    <main className="mx-auto max-w-330 px-4 py-6 md:py-10">
      <nav className="mb-5 text-xs text-neutral-500">
        <Link href="/" className="transition-colors hover:text-brand-700">Ana sayfa</Link>
        <span className="mx-2">&gt;</span>
        <span className="font-semibold text-neutral-800">Kampanyalar</span>
      </nav>

      <div className="mb-8 rounded-lg bg-linear-to-r from-brand-900 to-brand-600 px-6 py-8 text-white md:px-10 md:py-12">
        <h1 className="text-2xl font-bold md:text-4xl">Kampanyalar</h1>
        <p className="mt-2 text-sm text-white/80 md:text-base">
          İndirimli ürünleri kaçırma. {urunler.length} ürün seni bekliyor.
        </p>
      </div>

      <FiltreKutusu
        yol="/kampanyalar"
        siralamalar={SIRALAMALAR}
        sirala={sirala}
        indirimli={false}
        stok={sadeceStok}
        min={min}
        max={max}
      />

      {urunler.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-16 text-center">
          <p className="mb-4 text-neutral-600">
            {filtreVar
              ? "Bu filtrelere uygun kampanyalı ürün bulunamadı."
              : "Şu an kampanyalı ürün yok."}
          </p>
          {filtreVar && (
            <Link href="/kampanyalar" className="btn btn-primary">
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
              category={u.category.name}
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