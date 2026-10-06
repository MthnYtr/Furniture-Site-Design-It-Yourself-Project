import Uyari from "@/components/Uyari";
import { prisma } from "@/lib/prisma";
import { kategoriEkle, kategoriGuncelle, kategoriSil } from "./actions";

export const dynamic = "force-dynamic";

const alan = "border border-neutral-300 bg-white px-3 py-2 text-sm";

const HATALAR: Record<string, { baslik: string; aciklama: string }> = {
  eksik: { baslik: "Kategori adı boş olamaz", aciklama: "Lütfen bir ad yaz." },
  tekrar: { baslik: "Bu ad zaten kullanılıyor", aciklama: "Aynı ad veya adres başka bir kategoride var." },
  urunvar: { baslik: "Kategori silinemedi", aciklama: "İçinde ürün olan kategori silinemez. Önce ürünleri başka kategoriye taşı." },
  gorsel: { baslik: "Görsel yüklenemedi", aciklama: "Sadece JPG, PNG veya WEBP kabul edilir ve boyut en fazla 10 MB olmalı." },
  genel: { baslik: "Bir sorun oluştu", aciklama: "İşlem tamamlanamadı, tekrar dene." },
};

export default async function Kategoriler({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  const { hata } = await searchParams;
  const h = hata ? (HATALAR[hata] ?? HATALAR.genel) : null;
  const kategoriler = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-light">Kategoriler ({kategoriler.length})</h1>

      {h && <Uyari tip="hata" baslik={h.baslik}>{h.aciklama}</Uyari>}

      <form action={kategoriEkle} className="mb-8 flex flex-wrap items-end gap-3 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-neutral-600">Yeni kategori</label>
          <input name="name" placeholder="Örn: Ayakkabılıklar" required className={alan} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-neutral-600">Sıra</label>
          <input name="sortOrder" type="number" defaultValue={0} className={`${alan} w-20`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-neutral-600">Görsel (isteğe bağlı)</label>
          <input name="gorsel" type="file" accept=".jpg,.jpeg,.jfif,.png,.webp,image/jpeg,image/png,image/webp" className="text-sm" />
        </div>
        <button className="bg-brand-700 px-5 py-2 text-sm font-bold text-white hover:bg-brand-800">
          EKLE
        </button>
      </form>

      <div className="space-y-3">
        {kategoriler.map((k) => (
          <div key={k.id} className="bg-white p-3 shadow-sm">
            <form action={kategoriGuncelle} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={k.id} />

              <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden bg-neutral-100 text-xs text-neutral-400">
                {k.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={k.image} alt={k.name} className="h-full w-full object-cover" />
                ) : (
                  "Görsel yok"
                )}
              </div>

              <div className="flex min-w-48 flex-1 flex-col gap-2">
                <div className="flex gap-2">
                  <input name="name" defaultValue={k.name} required className={`${alan} flex-1`} />
                  <input name="sortOrder" type="number" defaultValue={k.sortOrder} className={`${alan} w-20`} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                  <input name="gorsel" type="file" accept=".jpg,.jpeg,.jfif,.png,.webp,image/jpeg,image/png,image/webp" className="text-xs" />
                  {k.image && (
                    <label className="flex items-center gap-1">
                      <input type="checkbox" name="gorselSil" /> Görseli kaldır
                    </label>
                  )}
                </div>
              </div>

              <span className="w-16 text-xs text-neutral-500">{k._count.products} ürün</span>
              <button className="px-3 py-2 text-sm text-brand-700 hover:underline">Kaydet</button>
            </form>
            <form action={kategoriSil} className="mt-1 text-right">
              <input type="hidden" name="id" value={k.id} />
              <button className="px-3 py-1 text-xs text-red-600 hover:underline">Sil</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}