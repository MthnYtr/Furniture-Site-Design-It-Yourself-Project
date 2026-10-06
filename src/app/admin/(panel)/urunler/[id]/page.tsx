import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UrunFormu from "@/components/admin/UrunFormu";
import { kaydetUrun, urunSil } from "../actions";
import { ozellikOku, satirlardanMetne } from "@/lib/ozellik";
import Link from "next/link";

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
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!urun) notFound();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-light">Ürünü düzenle</h1>
      <Link
        href={`/admin/urunler/${urun.id}/secenekler`}
        className="mb-6 inline-block text-sm text-brand-700 hover:underline"
      >
        Seçenekleri yönet (renk, ölçü) →
      </Link>
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

      <form action={urunSil} className="mt-8 max-w-3xl border border-red-200 bg-red-50 p-5 text-sm">
        <input type="hidden" name="id" value={urun.id} />
        <p className="mb-3 font-semibold text-red-700">Ürünü sil</p>
        <label className="mb-3 flex items-center gap-2">
          <input type="checkbox" required /> Bu ürünü kalıcı olarak silmek istediğimi onaylıyorum
        </label>
        <button className="bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700">
          SİL
        </button>
      </form>
    </div>
  );
}