import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const tl = (n: number) =>
  n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";

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
      variants: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!urun || !urun.isActive) notFound();

  const benzerler = await prisma.product.findMany({
    where: { categoryId: urun.categoryId, id: { not: urun.id }, isActive: true },
    include: { category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    take: 4,
  });

  const fiyat = Number(urun.basePrice);
  const indirimli = urun.salePrice ? Number(urun.salePrice) : null;

  return (
    <main className="mx-auto max-w-330 px-4 py-8">
      <nav className="mb-6 text-xs text-neutral-500">
        <Link href="/" className="hover:underline">Ana sayfa</Link>
        <span className="mx-2">&gt;</span>
        <Link href={`/kategori/${urun.category.slug}`} className="hover:underline">
          {urun.category.name}
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="font-semibold text-neutral-800">{urun.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
                    <div className="flex aspect-4/3 items-center justify-center overflow-hidden bg-neutral-100 text-neutral-400">
            {urun.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urun.images[0].url}
                alt={urun.name}
                className="h-full w-full object-cover"
              />
            ) : (
              "Görsel yakında"
            )}
          </div>

          <h1 className="mt-8 text-lg font-semibold uppercase tracking-wide">
            {urun.name}{" "}
            <span className="text-sm font-normal text-neutral-500">({urun.sku})</span>
          </h1>

          {urun.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-700">
              {urun.description}
            </p>
          )}

          {urun.type === "CONFIGURABLE" && (
            <div className="mt-8 rounded border border-indigo-200 bg-indigo-50 p-5 text-sm">
              <b>Kendin Tasarla:</b> Bu ürünü kendi ölçü ve parçalarınla tasarlayabilirsin.
              (3D tasarım aracı yakında)
            </div>
          )}
        </div>

        <aside className="h-fit border border-neutral-200">
          <div className="p-5 text-center">
            {indirimli ? (
              <>
                <div className="text-lg text-amber-700">{tl(fiyat)}</div>
                <div className="mt-2 bg-red-50 py-3">
                  <div className="text-sm text-red-600">Sepette indirimli fiyat</div>
                  <div className="text-2xl font-semibold text-red-700">{tl(indirimli)}</div>
                </div>
              </>
            ) : (
              <div className="text-2xl font-semibold">{tl(fiyat)}</div>
            )}
          </div>

          {urun.variants.length > 0 && (
            <div className="border-t border-neutral-200 p-5 text-sm">
              <div className="mb-2 font-semibold">Seçenekler</div>
              <ul className="space-y-1">
                {urun.variants.map((v) => (
                  <li key={v.id} className="flex justify-between">
                    <span>{v.name}</span>
                    <span>{tl(Number(v.price))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-5 pt-0">
            <button
              type="button"
              className="w-full bg-teal-700 py-3 text-sm font-bold tracking-wide text-white hover:bg-teal-800"
            >
              SEPETE EKLE
            </button>
          </div>

          <div className="border-t border-neutral-200 p-5 text-xs text-neutral-600">
            Hızlı teslimat · Kurulum hizmeti · 2 yıl garanti
          </div>
        </aside>
      </div>

      {benzerler.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-center text-xl tracking-widest">ALTERNATİF ÜRÜNLER</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {benzerler.map((u) => (
              <ProductCard
                key={u.id}
                slug={u.slug}
                name={u.name}
                basePrice={Number(u.basePrice)}
                salePrice={u.salePrice ? Number(u.salePrice) : null}
                category={u.category.name}
                image={u.images[0]?.url ?? null}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}