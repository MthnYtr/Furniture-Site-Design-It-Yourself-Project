import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Uyari from "@/components/Uyari";
import { varyantKaydet, varyantSil } from "../../varyantlar-actions";

export const dynamic = "force-dynamic";

const HATALAR: Record<string, { baslik: string; aciklama: string }> = {
  eksik: { baslik: "Eksik bilgi", aciklama: "Ad, kod ve geçerli bir fiyat gir." },
  sku: { baslik: "Bu kod zaten kullanılıyor", aciklama: "Bu kod başka bir seçenekte var." },
  genel: { baslik: "Kaydedilemedi", aciklama: "Kaydedilirken bir sorun oluştu." },
};

const etiket = "mb-1.5 block text-xs font-semibold text-neutral-600";

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

  const h = hata ? (HATALAR[hata] ?? HATALAR.genel) : null;

  return (
    <div className="max-w-4xl">
      <Link
        href={`/admin/urunler/${urun.id}`}
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        &larr; Ürüne dön
      </Link>
      <h1 className="mb-2 mt-3 text-2xl font-bold">Seçenekler</h1>
      <p className="mb-1 font-semibold">{urun.name}</p>
      <p className="mb-6 rounded-md bg-brand-50 px-4 py-3 text-xs leading-5 text-brand-900">
        Her seçeneğin kendi fiyatı, stoğu ve ürün kodu olur (örn: &quot;80 cm - Beyaz&quot;).
        Ürünün fiyatı otomatik olarak en düşük seçenek fiyatına, stoğu seçeneklerin toplamına
        ayarlanır. İndirim oranı ürün sayfasındaki Fiyat ve İndirimli fiyat alanlarından
        hesaplanır ve tüm seçeneklere uygulanır.
      </p>

      {h && (
        <Uyari tip="hata" baslik={h.baslik}>
          {h.aciklama}
        </Uyari>
      )}

      <section className="mb-8 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3 text-sm font-bold">
          Mevcut seçenekler ({urun.variants.length})
        </div>

        {urun.variants.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">
            Henüz seçenek yok. Seçenek eklemezsen ürün tek fiyatla satılır.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {urun.variants.map((v) => (
              <li key={v.id} className="p-4">
                <form
                  action={varyantKaydet}
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_8rem_6rem_auto] lg:items-end"
                >
                  <input type="hidden" name="productId" value={urun.id} />
                  <input type="hidden" name="id" value={v.id} />
                  <div>
                    <label className={etiket}>Seçenek adı</label>
                    <input name="name" defaultValue={v.name} required className="input" />
                  </div>
                  <div>
                    <label className={etiket}>Ürün kodu</label>
                    <input name="sku" defaultValue={v.sku} required className="input font-mono" />
                  </div>
                  <div>
                    <label className={etiket}>Fiyat (TL)</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={Number(v.price)}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className={etiket}>Stok</label>
                    <input name="stock" type="number" min="0" defaultValue={v.stock} className="input" />
                  </div>
                  <button className="btn btn-primary px-5 py-2.5">Kaydet</button>
                </form>

                <form action={varyantSil} className="mt-2 text-right">
                  <input type="hidden" name="productId" value={urun.id} />
                  <input type="hidden" name="id" value={v.id} />
                  <button className="text-xs font-semibold text-red-600 hover:underline">
                    Bu seçeneği sil
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">Yeni seçenek ekle</h2>
        <form
          action={varyantKaydet}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_8rem_6rem_auto] lg:items-end"
        >
          <input type="hidden" name="productId" value={urun.id} />
          <div>
            <label className={etiket}>Seçenek adı</label>
            <input name="name" placeholder="80 cm - Beyaz" required className="input" />
          </div>
          <div>
            <label className={etiket}>Ürün kodu</label>
            <input name="sku" placeholder={`${urun.sku}-80B`} required className="input font-mono" />
          </div>
          <div>
            <label className={etiket}>Fiyat (TL)</label>
            <input name="price" type="number" step="0.01" min="0" required className="input" />
          </div>
          <div>
            <label className={etiket}>Stok</label>
            <input name="stock" type="number" min="0" defaultValue={0} className="input" />
          </div>
          <button className="btn btn-primary px-5 py-2.5">+ EKLE</button>
        </form>
      </section>
    </div>
  );
}