import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
    const urunler = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  const kategoriler = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-y border-neutral-200 bg-neutral-50 px-4 py-3 text-sm md:text-lg">
        <span className="whitespace-nowrap">Peşin Fiyatına 9 Taksit</span>
        <span className="hidden text-neutral-300 sm:inline">|</span>
        <span className="whitespace-nowrap">3 Ay Ödeme Erteleme</span>
        <span className="hidden text-neutral-300 sm:inline">|</span>
        <span className="whitespace-nowrap">36 Aya Varan Alışveriş Kredisi</span>
      </div>

      <section className="bg-linear-to-r from-[#efe6d8] to-[#d9c9b0]">
        <div className="mx-auto flex max-w-330 flex-col items-start gap-5 px-4 py-12 md:py-24">
          <span className="rounded-full border border-amber-700 px-4 py-1 text-sm font-semibold text-amber-800">
            SONBAHAR FIRSATLARI DEVAM EDİYOR
          </span>
          <h1 className="text-3xl font-light leading-tight md:text-5xl text-[#7a3b1d]">
            Sepette <b>%20&apos;ye Varan</b>
            <br />
            İndirim Fırsatlarını Kaçırma
          </h1>
          <Link
            href="#"
            className="rounded-full border border-amber-700 bg-amber-100 px-6 py-2 text-sm font-semibold text-amber-800"
          >
            HEMEN KEŞFET &gt;
          </Link>
        </div>
      </section>

            <section className="mx-auto max-w-330 px-4 py-8 md:py-14">
        <h2 className="mb-5 text-center text-xl tracking-widest md:mb-8 md:text-2xl">
          ÖNE ÇIKANLAR
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {kategoriler.slice(0, 4).map((k) => (
            <Link
              key={k.id}
              href={`/kategori/${k.slug}`}
              className="flex h-16 items-center justify-center bg-neutral-100 px-2 text-center text-sm font-medium hover:bg-neutral-200 md:aspect-4/3 md:h-auto md:text-lg"
            >
              {k.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-330 px-4 pb-12 md:pb-20">
        <h2 className="mb-5 text-center text-xl tracking-widest md:mb-8 md:text-2xl">
          ÇOK SATANLAR
        </h2>
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
      </section>
    </main>
  );
}