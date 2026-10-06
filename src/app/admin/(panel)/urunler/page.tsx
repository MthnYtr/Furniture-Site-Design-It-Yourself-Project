import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const tl = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";

export default async function UrunListesi({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = ((await searchParams).q ?? "").trim();

  const urunler = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { variants: { some: { sku: { contains: q } } } },
          ],
        }
      : {},
    include: {
      category: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ürünler ({urunler.length})</h1>
        <Link href="/admin/urunler/yeni" className="btn btn-primary px-6 py-2.5">
          + YENİ ÜRÜN
        </Link>
      </div>

      <form method="get" className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Ürün adı veya kodu ara..."
          className="input max-w-sm"
        />
        <button className="btn btn-outline px-5 py-2.5">Ara</button>
        {q && (
          <Link href="/admin/urunler" className="btn btn-soft px-4 py-2.5">
            Temizle
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full min-w-170 text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-3">Ürün</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Fiyat</th>
              <th className="p-3">Stok</th>
              <th className="p-3">Durum</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {urunler.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-neutral-500">
                  {q ? "Aramana uygun ürün bulunamadı." : "Henüz ürün yok."}
                </td>
              </tr>
            )}
            {urunler.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="p-3">
                  <Link href={`/admin/urunler/${u.id}`} className="flex items-center gap-3">
                    {u.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.images[0].url} alt="" className="h-11 w-14 shrink-0 rounded object-cover" />
                    ) : (
                      <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded bg-neutral-100 text-[10px] text-neutral-400">
                        yok
                      </span>
                    )}
                    <span>
                      <span className="font-semibold">{u.name}</span>
                      <span className="block font-mono text-xs text-neutral-400">
                        {u.sku}
                        {u._count.variants > 0 && (
                          <span className="ml-2 font-sans text-brand-700">
                            {u._count.variants} seçenek
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="p-3">{u.category.name}</td>
                <td className="p-3">
                  {u.salePrice ? (
                    <>
                      <span className="mr-1 text-neutral-400 line-through">{tl(Number(u.basePrice))}</span>
                      <span className="font-semibold text-red-600">{tl(Number(u.salePrice))}</span>
                    </>
                  ) : (
                    <span className="font-semibold">{tl(Number(u.basePrice))}</span>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      u.stock <= 0
                        ? "bg-red-50 text-red-700"
                        : u.stock <= 5
                          ? "bg-amber-50 text-amber-800"
                          : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {u.stock}
                  </span>
                </td>
                <td className="p-3">
                  {u.isActive ? (
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      Yayında
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-500">
                      Gizli
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/urunler/${u.id}`} className="font-semibold text-brand-700 hover:underline">
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}