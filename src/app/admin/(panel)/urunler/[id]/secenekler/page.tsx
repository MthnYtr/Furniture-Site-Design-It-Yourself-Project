import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { varyantKaydet, varyantSil } from "../../varyantlar-actions";

export const dynamic = "force-dynamic";

const alan = "border border-neutral-300 bg-white px-3 py-2 text-sm";

const HATALAR: Record<string, string> = {
  eksik: "Ad, SKU ve geçerli bir fiyat gir.",
  sku: "Bu SKU başka bir seçenekte kullanılıyor.",
  genel: "Kaydedilirken bir sorun oluştu.",
};

export default async function Secenekler({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hata?: string }>;
}) {
  const id = Number((await params).id);
  const { hata } = await searchParams;
  if (!id) notFound();

  const urun = await prisma.product.findUnique({
    where: { id },
    include: { variants: { orderBy: { price: "asc" } } },
  });
  if (!urun) notFound();

  return (
    <div className="max-w-4xl">
      <Link href={`/admin/urunler/${urun.id}`} className="text-sm text-brand-700 hover:underline">
        ← Ürüne dön
      </Link>
      <h1 className="mb-2 mt-2 text-2xl font-light">Seçenekler: {urun.name}</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Her seçeneğin kendi fiyatı ve stoğu olur (örn: &quot;80 cm - Beyaz&quot;). Ürünün
        fiyatı otomatik olarak en düşük seçenek fiyatına, stoğu seçeneklerin toplamına
        ayarlanır. İndirim oranı ürün sayfasındaki Fiyat ve İndirimli fiyat alanlarından
        hesaplanır ve tüm seçeneklere uygulanır.
      </p>

      {hata && (
        <p className="mb-4 bg-red-50 p-3 text-sm text-red-600">
          {HATALAR[hata] ?? HATALAR.genel}
        </p>
      )}

      <div className="mb-8 space-y-2">
        {urun.variants.length === 0 && (
          <p className="text-sm text-neutral-500">
            Henüz seçenek yok. Seçenek eklemezsen ürün tek fiyatla satılır.
          </p>
        )}

        {urun.variants.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-2 bg-white p-3 shadow-sm">
            <form action={varyantKaydet} className="flex flex-1 flex-wrap items-center gap-2">
              <input type="hidden" name="productId" value={urun.id} />
              <input type="hidden" name="id" value={v.id} />
              <input name="name" defaultValue={v.name} required className={`${alan} min-w-40 flex-1`} />
              <input name="sku" defaultValue={v.sku} required className={`${alan} w-32`} />
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={Number(v.price)}
                required
                className={`${alan} w-28`}
              />
              <input name="stock" type="number" min="0" defaultValue={v.stock} className={`${alan} w-20`} />
              <button className="px-3 py-2 text-sm text-brand-700 hover:underline">Kaydet</button>
            </form>
            <form action={varyantSil}>
              <input type="hidden" name="productId" value={urun.id} />
              <input type="hidden" name="id" value={v.id} />
              <button className="px-3 py-2 text-sm text-red-600 hover:underline">Sil</button>
            </form>
          </div>
        ))}
      </div>

      <form action={varyantKaydet} className="flex flex-wrap items-end gap-2 border border-neutral-200 bg-white p-4">
        <input type="hidden" name="productId" value={urun.id} />
        <div className="min-w-40 flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase text-neutral-600">Seçenek adı</label>
          <input name="name" placeholder="80 cm - Beyaz" required className={`${alan} w-full`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-neutral-600">SKU</label>
          <input name="sku" placeholder={`${urun.sku}-80B`} required className={`${alan} w-32`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-neutral-600">Fiyat (TL)</label>
          <input name="price" type="number" step="0.01" min="0" required className={`${alan} w-28`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-neutral-600">Stok</label>
          <input name="stock" type="number" min="0" defaultValue={0} className={`${alan} w-20`} />
        </div>
        <button className="bg-brand-700 px-5 py-2 text-sm font-bold text-white hover:bg-brand-800">
          + EKLE
        </button>
      </form>
    </div>
  );
}