import { prisma } from "@/lib/prisma";
import { kategoriEkle, kategoriGuncelle, kategoriSil } from "./actions";

export const dynamic = "force-dynamic";

const alan = "border border-neutral-300 bg-white px-3 py-2 text-sm";

const HATALAR: Record<string, string> = {
  eksik: "Kategori adı boş olamaz.",
  tekrar: "Bu ad veya adres başka bir kategoride kullanılıyor.",
  urunvar: "İçinde ürün olan kategori silinemez. Önce ürünleri başka kategoriye taşı.",
  genel: "İşlem sırasında bir sorun oluştu.",
};

export default async function Kategoriler({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  const { hata } = await searchParams;
  const kategoriler = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-light">Kategoriler ({kategoriler.length})</h1>

      {hata && (
        <p className="mb-4 bg-red-50 p-3 text-sm text-red-600">
          {HATALAR[hata] ?? HATALAR.genel}
        </p>
      )}

      <form action={kategoriEkle} className="mb-8 flex flex-wrap items-end gap-3 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-neutral-600">Yeni kategori</label>
          <input name="name" placeholder="Örn: Ayakkabılıklar" required className={alan} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-neutral-600">Sıra</label>
          <input name="sortOrder" type="number" defaultValue={0} className={`${alan} w-20`} />
        </div>
        <button className="bg-teal-700 px-5 py-2 text-sm font-bold text-white hover:bg-teal-800">
          EKLE
        </button>
      </form>

      <div className="space-y-2">
        {kategoriler.map((k) => (
          <div key={k.id} className="flex items-center gap-3 bg-white p-3 shadow-sm">
            <form action={kategoriGuncelle} className="flex flex-1 items-center gap-3">
              <input type="hidden" name="id" value={k.id} />
              <input name="name" defaultValue={k.name} required className={`${alan} flex-1`} />
              <input name="sortOrder" type="number" defaultValue={k.sortOrder} className={`${alan} w-20`} />
              <span className="w-20 text-xs text-neutral-500">{k._count.products} ürün</span>
              <button className="px-3 py-2 text-sm text-teal-700 hover:underline">Kaydet</button>
            </form>
            <form action={kategoriSil}>
              <input type="hidden" name="id" value={k.id} />
              <button className="px-3 py-2 text-sm text-red-600 hover:underline">Sil</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}