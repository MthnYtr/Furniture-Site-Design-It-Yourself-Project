import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mevcutMusteri } from "@/lib/musteri";
import ProductCard from "@/components/ProductCard";
import { favoriDegistir } from "./actions";

export const dynamic = "force-dynamic";

export default async function Favorilerim() {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim/favoriler");

  const favoriler = (
    await prisma.favorite.findMany({
      where: { userId: musteri.id },
      include: {
        product: {
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            _count: { select: { variants: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  ).filter((f) => f.product.isActive);

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Favorilerim ({favoriler.length})</h2>

      {favoriler.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-14 text-center">
          <svg
            viewBox="0 0 24 24"
            className="mx-auto mb-3 h-12 w-12 text-brand-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 6.8 4.5 4.5 0 0 1 20 9.5c0 6.1-8 11-8 11z" />
          </svg>
          <p className="mb-1 font-semibold">Henüz favori ürünün yok</p>
          <p className="mb-5 text-sm text-neutral-500">
            Ürün sayfalarındaki &quot;Favorilere ekle&quot; düğmesiyle beğendiklerini buraya kaydedebilirsin.
          </p>
          <Link href="/" className="btn btn-primary px-8">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {favoriler.map(({ product: u }) => (
            <div key={u.id}>
              <ProductCard
                slug={u.slug}
                name={u.name}
                basePrice={Number(u.basePrice)}
                salePrice={u.salePrice ? Number(u.salePrice) : null}
                category={u.category.name}
                image={u.images[0]?.url ?? null}
                soldOut={u.stock <= 0}
                baslayan={u._count.variants > 0}
              />
              <form action={favoriDegistir} className="mt-2">
                <input type="hidden" name="productId" value={u.id} />
                <input type="hidden" name="donus" value="/hesabim/favoriler" />
                <button className="flex w-full items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white py-2 text-xs font-semibold text-neutral-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 6.8 4.5 4.5 0 0 1 20 9.5c0 6.1-8 11-8 11z" />
                  </svg>
                  Favorilerden çıkar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}