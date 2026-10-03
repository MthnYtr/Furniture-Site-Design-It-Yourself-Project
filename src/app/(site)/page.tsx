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
      <div className="border-y border-neutral-200 bg-neutral-50 py-3 text-center text-lg">
        Peşin Fiyatına 9 Taksit <span className="mx-3 text-neutral-300">|</span>
        3 Ay Ödeme Erteleme <span className="mx-3 text-neutral-300">|</span>
        36 Aya Varan Alışveriş Kredisi
      </div>

      <section className="bg-linear-to-r from-[#efe6d8] to-[#d9c9b0]">
        <div className="mx-auto flex max-w-330 flex-col items-start gap-5 px-4 py-24">
          <span className="rounded-full border border-amber-700 px-4 py-1 text-sm font-semibold text-amber-800">
            SONBAHAR FIRSATLARI DEVAM EDİYOR
          </span>
          <h1 className="text-5xl font-light leading-tight text-[#7a3b1d]">
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

      <section className="mx-auto max-w-330 px-4 py-14">
        <h2 className="mb-8 text-center text-2xl tracking-widest">ÖNE ÇIKANLAR</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {kategoriler.slice(0, 4).map((k) => (
            <Link
              key={k.id}
              href={`/kategori/${k.slug}`}
              className="flex aspect-4/3 items-center justify-center bg-neutral-100 text-lg font-medium hover:bg-neutral-200"
            >
              {k.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-330 px-4 pb-20">
        <h2 className="mb-8 text-center text-2xl tracking-widest">ÇOK SATANLAR</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {urunler.map((u) => (
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
    </main>
  );
}