import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const tl = (n: number) =>
  n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";

export default async function UrunListesi() {
  const urunler = await prisma.product.findMany({
    include: { category: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-light">Ürünler ({urunler.length})</h1>
        <Link
          href="/admin/urunler/yeni"
          className="bg-teal-700 px-5 py-2 text-sm font-bold text-white hover:bg-teal-800"
        >
          + YENİ ÜRÜN
        </Link>
      </div>

      <table className="w-full bg-white text-sm shadow-sm">
        <thead className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
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
          {urunler.map((u) => (
            <tr key={u.id} className="border-b border-neutral-100">
              <td className="flex items-center gap-3 p-3">
                {u.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.images[0].url} alt="" className="h-10 w-14 object-cover" />
                ) : (
                  <span className="flex h-10 w-14 items-center justify-center bg-neutral-100 text-[10px] text-neutral-400">
                    yok
                  </span>
                )}
                <span>
                  {u.name}
                  <span className="block text-xs text-neutral-400">{u.sku}</span>
                </span>
              </td>
              <td className="p-3">{u.category.name}</td>
              <td className="p-3">
                {u.salePrice ? (
                  <>
                    <span className="mr-1 text-neutral-400 line-through">
                      {tl(Number(u.basePrice))}
                    </span>
                    {tl(Number(u.salePrice))}
                  </>
                ) : (
                  tl(Number(u.basePrice))
                )}
              </td>
              <td className="p-3">{u.stock}</td>
              <td className="p-3">
                {u.isActive ? (
                  <span className="text-green-700">Yayında</span>
                ) : (
                  <span className="text-neutral-400">Gizli</span>
                )}
              </td>
              <td className="p-3 text-right">
                <Link href={`/admin/urunler/${u.id}`} className="text-teal-700 hover:underline">
                  Düzenle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}