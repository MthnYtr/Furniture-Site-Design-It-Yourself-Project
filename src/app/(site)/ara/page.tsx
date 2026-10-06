import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Arama",
  robots: { index: false, follow: true },
};

export default async function AraSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const temiz = q.trim().slice(0, 100);
  const kelimeler = temiz.split(/\s+/).filter(Boolean).slice(0, 5);

  const urunler =
    kelimeler.length === 0
      ? []
      : await prisma.product.findMany({
          where: {
            isActive: true,
            AND: kelimeler.map((k) => ({
              OR: [
                { name: { contains: k } },
                { description: { contains: k } },
                { sku: { contains: k } },
                { category: { name: { contains: k } } },
              ],
            })),
          },
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            _count: { select: { variants: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 48,
        });

  return (
    <main className="mx-auto max-w-330 px-4 py-8">
      <h1 className="mb-1 text-2xl font-light md:text-3xl">
        {temiz ? `"${temiz}" araması` : "Arama"}
      </h1>
      <p className="mb-8 text-sm text-neutral-500">
        {temiz ? `${urunler.length} ürün bulundu` : "Aramak istediğin ürünü yukarıdaki kutuya yaz."}
      </p>

      {temiz && urunler.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">
          Sonuç bulunamadı. Başka bir kelime deneyebilirsin (örneğin: raf, kitaplık, masa).
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
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