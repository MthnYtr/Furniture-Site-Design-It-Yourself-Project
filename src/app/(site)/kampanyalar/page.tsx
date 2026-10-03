import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Kampanyalar() {
  const urunler = await prisma.product.findMany({
    where: { isActive: true, salePrice: { not: null } },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-330 px-4 py-8">
      <h1 className="mb-1 text-2xl font-light md:text-3xl">Kampanyalar</h1>
      <p className="mb-8 text-sm text-neutral-500">{urunler.length} indirimli ürün</p>

      {urunler.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">Şu an indirimli ürün yok.</p>
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
            />
          ))}
        </div>
      )}
    </main>
  );
}