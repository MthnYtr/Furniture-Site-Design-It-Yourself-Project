import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function KategoriSayfasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const kategori = await prisma.category.findUnique({
    where: { slug },
        include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
    },
  });

  if (!kategori) notFound();

  return (
    <main className="mx-auto max-w-330 px-4 py-8">
      <nav className="mb-6 text-xs text-neutral-500">
        <Link href="/" className="hover:underline">Ana sayfa</Link>
        <span className="mx-2">&gt;</span>
        <span className="font-semibold text-neutral-800">{kategori.name}</span>
      </nav>

      <h1 className="mb-1 text-3xl font-light">{kategori.name}</h1>
      <p className="mb-8 text-sm text-neutral-500">{kategori.products.length} ürün</p>

      {kategori.products.length === 0 ? (
        <p className="py-20 text-center text-neutral-500">Bu kategoride henüz ürün yok.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {kategori.products.map((u) => (
            <ProductCard
              key={u.id}
              slug={u.slug}
              name={u.name}
              basePrice={Number(u.basePrice)}
              salePrice={u.salePrice ? Number(u.salePrice) : null}
              category={kategori.name}
              image={u.images[0]?.url ?? null}
              soldOut={u.stock <= 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}