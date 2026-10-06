import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import UrunGalerisi from "@/components/UrunGalerisi";
import UrunSatinAl from "@/components/UrunSatinAl";
import { mevcutMusteri } from "@/lib/musteri";
import { favoriDegistir } from "../../hesabim/favoriler/actions";
import { ozellikOku } from "@/lib/ozellik";
import { kisalt, mutlakUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const u = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      isActive: true,
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });
  if (!u || !u.isActive) return { title: "Ürün bulunamadı" };

  const aciklama =
    kisalt(u.description) ||
    `${u.name} - ${u.category.name}. Hızlı teslimat, kurulum hizmeti ve 2 yıl garanti.`;
  const resim = u.images[0]?.url;

  return {
    title: u.name,
    description: aciklama,
    alternates: { canonical: `/urun/${slug}` },
    openGraph: {
      title: u.name,
      description: aciklama,
      url: `/urun/${slug}`,
      type: "website",
      ...(resim ? { images: [{ url: resim, alt: u.name }] } : {}),
    },
    twitter: {
      card: resim ? "summary_large_image" : "summary",
      title: u.name,
      description: aciklama,
    },
  };
}

function Artiisaret() {
  return (
    <>
      <span className="text-lg group-open:hidden">+</span>
      <span className="hidden text-lg group-open:inline">−</span>
    </>
  );
}

const ozetClass =
  "flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold transition-colors hover:bg-neutral-50 [&::-webkit-details-marker]:hidden";

export default async function UrunSayfasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const urun = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { orderBy: { price: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!urun || !urun.isActive) notFound();

  const benzerler = await prisma.product.findMany({
    where: { categoryId: urun.categoryId, id: { not: urun.id }, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { variants: true } },
    },
    take: 4,
  });

  const musteri = await mevcutMusteri();
  const favori = musteri
    ? await prisma.favorite.findUnique({
        where: { userId_productId: { userId: musteri.id, productId: urun.id } },
      })
    : null;

  const ozellikler = ozellikOku(urun.attributes, "ozellikler");
  const boyutlar = ozellikOku(urun.attributes, "boyutlar");

  const gecerliFiyat = Number(urun.salePrice ?? urun.basePrice);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: urun.name,
    sku: urun.sku,
    description: urun.description ?? undefined,
    image: urun.images.map((g) => mutlakUrl(g.url)),
    category: urun.category.name,
    offers: {
      "@type": "Offer",
      url: mutlakUrl(`/urun/${urun.slug}`),
      priceCurrency: "TRY",
      price: gecerliFiyat,
      availability:
        urun.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="mx-auto max-w-330 px-4 py-6 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <nav className="mb-5 text-xs text-neutral-500">
        <Link href="/" className="transition-colors hover:text-brand-700">Ana sayfa</Link>
        <span className="mx-2">&gt;</span>
        <Link href={`/kategori/${urun.category.slug}`} className="transition-colors hover:text-brand-700">
          {urun.category.name}
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="font-semibold text-neutral-800">{urun.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-x-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <UrunGalerisi
            gorseller={urun.images.map((g) => ({ id: g.id, url: g.url }))}
            ad={urun.name}
          />
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white lg:sticky lg:top-36">
            <div className="border-b border-neutral-100 p-5">
              <Link
                href={`/kategori/${urun.category.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-brand-700 hover:underline"
              >
                {urun.category.name}
              </Link>
              <h1 className="mt-1 text-xl font-bold leading-snug md:text-2xl">{urun.name}</h1>
            </div>

            <UrunSatinAl
              urunId={urun.id}
              urunKodu={urun.sku}
              stok={urun.stock}
              taban={Number(urun.basePrice)}
              indirimli={urun.salePrice ? Number(urun.salePrice) : null}
              secenekler={urun.variants.map((v) => ({
                id: v.id,
                ad: v.name,
                fiyat: Number(v.price),
                stok: v.stock,
                kod: v.sku,
              }))}
            />

            <div className="px-5 pb-5">
              <form action={favoriDegistir}>
                <input type="hidden" name="productId" value={urun.id} />
                <input type="hidden" name="donus" value={`/urun/${urun.slug}`} />
                <button className="btn btn-outline w-full py-3">
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-5 w-5 ${favori ? "text-red-600" : ""}`}
                    fill={favori ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 6.8 4.5 4.5 0 0 1 20 9.5c0 6.1-8 11-8 11z" />
                  </svg>
                  {favori ? "Favorilerimde" : "Favorilere ekle"}
                </button>
              </form>
            </div>

            <ul className="space-y-2 border-t border-neutral-100 bg-neutral-50 p-5 text-sm text-neutral-700">
              {["Hızlı teslimat", "Kurulum hizmeti", "2 yıl garanti"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          {urun.description && (
            <section className="mb-6">
              <h2 className="mb-3 text-lg font-bold">Ürün Açıklaması</h2>
              <p className="whitespace-pre-line text-sm leading-7 text-neutral-700">
                {urun.description}
              </p>
            </section>
          )}

          {urun.type === "CONFIGURABLE" && (
            <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-5 text-sm text-brand-900">
              <b>Kendin Tasarla:</b> Bu ürünü kendi ölçü ve parçalarınla tasarlayabilirsin.
              (3D tasarım aracı yakında)
            </div>
          )}

          <div className="space-y-3">
            {[
              { baslik: "Ürün özellikleri", satirlar: ozellikler },
              { baslik: "Ürün boyutları", satirlar: boyutlar },
            ]
              .filter((b) => b.satirlar.length > 0)
              .map((b) => (
                <details key={b.baslik} className="group overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <summary className={ozetClass}>
                    {b.baslik}
                    <Artiisaret />
                  </summary>
                  <dl className="divide-y divide-neutral-100 border-t border-neutral-200 text-sm">
                    {b.satirlar.map((s) => (
                      <div key={s.ad} className="flex gap-4 px-5 py-2.5">
                        <dt className="w-40 shrink-0 text-neutral-500">{s.ad}</dt>
                        <dd className="font-medium">{s.deger}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ))}

            <details className="group overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <summary className={ozetClass}>
                Teslimat ve iade
                <Artiisaret />
              </summary>
              <p className="border-t border-neutral-200 px-5 py-4 text-sm text-neutral-600">
                Teslimat ve iade koşulları için{" "}
                <Link href="/sayfa/teslimat-ve-iade" className="font-semibold text-brand-700 hover:underline">
                  bu sayfaya
                </Link>{" "}
                bakabilirsin.
              </p>
            </details>
          </div>
        </div>
      </div>

      {benzerler.length > 0 && (
        <section className="mt-16 md:mt-20">
          <div className="mb-6 text-center md:mb-10">
            <h2 className="text-xl font-semibold tracking-widest md:text-2xl">ALTERNATİF ÜRÜNLER</h2>
            <div className="mx-auto mt-3 h-0.5 w-12 bg-brand-700" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {benzerler.map((u) => (
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
        </section>
      )}
    </main>
  );
}