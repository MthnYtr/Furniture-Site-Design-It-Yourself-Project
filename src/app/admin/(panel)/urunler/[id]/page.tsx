import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UrunFormu from "@/components/admin/UrunFormu";
import { kaydetUrun, urunSil } from "../actions";
import { ozellikOku, satirlardanMetne } from "@/lib/ozellik";

export const dynamic = "force-dynamic";

export default async function UrunDuzenle({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hata?: string }>;
}) {
  const id = Number((await params).id);
  const { hata } = await searchParams;
  if (!id) notFound();

  const [urun, kategoriler] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!urun) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/urunler" className="text-sm font-semibold text-brand-700 hover:underline">
        &larr; Ürünler
      </Link>

      <div className="mb-6 mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{urun.name}</h1>
          <p className="mt-1 font-mono text-xs text-neutral-500">{urun.sku}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/urunler/${urun.id}/secenekler`}
            className="btn btn-outline px-5 py-2.5"
          >
            Seçenekleri yönet
            {urun._count.variants > 0 && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-800">
                {urun._count.variants}
              </span>
            )}
          </Link>
          {urun.isActive && (
            <Link href={`/urun/${urun.slug}`} target="_blank" className="btn btn-soft px-5 py-2.5">
              Sitede gör &nearr;
            </Link>
          )}
        </div>
      </div>

      <UrunFormu
        kategoriler={kategoriler}
        action={kaydetUrun.bind(null, urun.id)}
        hata={hata}
        urun={{
          id: urun.id,
          name: urun.name,
          slug: urun.slug,
          sku: urun.sku,
          description: urun.description,
          type: urun.type,
          basePrice: Number(urun.basePrice),
          salePrice: urun.salePrice ? Number(urun.salePrice) : null,
          stock: urun.stock,
          isActive: urun.isActive,
          categoryId: urun.categoryId,
          images: urun.images.map((g) => ({ id: g.id, url: g.url, sortOrder: g.sortOrder })),
          ozellikler: satirlardanMetne(ozellikOku(urun.attributes, "ozellikler")),
          boyutlar: satirlardanMetne(ozellikOku(urun.attributes, "boyutlar")),
        }}
      />

      <form
        action={urunSil}
        className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm"
      >
        <input type="hidden" name="id" value={urun.id} />
        <p className="mb-1 font-bold text-red-700">Ürünü sil</p>
        <p className="mb-3 text-xs text-red-600">
          Siparişlerde geçen ürünler silinemez. Onların yerine &quot;Yayında&quot; kutusunu kaldır.
        </p>
        <label className="mb-3 flex items-center gap-2">
          <input type="checkbox" required className="accent-red-600" />
          Bu ürünü kalıcı olarak silmek istediğimi onaylıyorum
        </label>
        <button className="rounded-md bg-red-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700">
          SİL
        </button>
      </form>
    </div>
  );
}