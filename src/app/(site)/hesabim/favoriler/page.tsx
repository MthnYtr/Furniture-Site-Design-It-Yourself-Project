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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  ).filter((f) => f.product.isActive);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Favorilerim ({favoriler.length})</h2>

      {favoriler.length === 0 ? (
        <p className="py-10 text-center text-neutral-500">
          Henüz favori ürünün yok. Ürün sayfalarındaki kalp düğmesiyle ekleyebilirsin.{" "}
          <Link href="/" className="text-teal-700 hover:underline">
            Alışverişe başla
          </Link>
        </p>
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
              />
              <form action={favoriDegistir} className="mt-2">
                <input type="hidden" name="productId" value={u.id} />
                <input type="hidden" name="donus" value="/hesabim/favoriler" />
                <button className="text-xs text-red-600 hover:underline">Favorilerden çıkar</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}