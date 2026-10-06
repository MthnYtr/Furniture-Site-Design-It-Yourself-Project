import Uyari from "@/components/Uyari";
import { prisma } from "@/lib/prisma";
import { kategoriEkle, kategoriGuncelle, kategoriSil } from "./actions";

export const dynamic = "force-dynamic";

const etiket = "mb-1 block text-xs font-semibold text-neutral-600";
const KABUL = ".jpg,.jpeg,.jfif,.png,.webp,image/jpeg,image/png,image/webp";

const HATALAR: Record<string, { baslik: string; aciklama: string }> = {
  eksik: { baslik: "Eksik bilgi", aciklama: "Kategori adı boş olamaz." },
  tekrar: { baslik: "Aynı kategori var", aciklama: "Bu ad veya adres başka bir kategoride kullanılıyor." },
  urunvar: { baslik: "Silinemedi", aciklama: "İçinde ürün olan kategori silinemez. Önce ürünleri başka kategoriye taşı." },
  gorsel: { baslik: "Görsel yüklenemedi", aciklama: "Sadece JPG, PNG veya WEBP kabul edilir ve boyut en fazla 10 MB olmalı." },
  genel: { baslik: "Bir sorun oluştu", aciklama: "İşlem sırasında bir sorun oluştu, tekrar dene." },
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

  const h = hata ? (HATALAR[hata] ?? HATALAR.genel) : null;

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold text-brand-900">Kategoriler ({kategoriler.length})</h1>
      <p className="mb-6 text-sm text-neutral-500">Görsel eklersen anasayfada ve kategori sayfasında görünür.</p>

      {h && (
        <Uyari tip="hata" baslik={h.baslik}>
          {h.aciklama}
        </Uyari>
      )}

      <form action={kategoriEkle} className="card mb-6 grid items-end gap-3 p-5 md:grid-cols-[1fr_90px_1fr_auto]">
        <div>
          <label className={etiket}>Yeni kategori</label>
          <input name="name" placeholder="Örn: Ayakkabılıklar" required className="input" />
        </div>
        <div>
          <label className={etiket}>Sıra</label>
          <input name="sortOrder" type="number" defaultValue={0} className="input" />
        </div>
        <div>
          <label className={etiket}>Görsel (isteğe bağlı)</label>
          <input name="gorsel" type="file" accept={KABUL} className="input text-xs" />
        </div>
        <button className="btn btn-primary py-2.5">Ekle</button>
      </form>

      <div className="space-y-3">
        {kategoriler.map((k) => (
          <div key={k.id} className="card flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-[11px] text-neutral-400">
              {k.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={k.image} alt={k.name} className="h-full w-full object-cover" />
              ) : (
                "Görsel yok"
              )}
            </div>

            <form action={kategoriGuncelle} className="flex flex-1 flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={k.id} />
              <input name="name" defaultValue={k.name} required className="input min-w-40 flex-1" />
              <input name="sortOrder" type="number" defaultValue={k.sortOrder} className="input w-20" title="Sıra" />
              <input name="gorsel" type="file" accept={KABUL} className="input w-56 text-xs" />
              {k.image && (
                <label className="flex items-center gap-1.5 text-xs text-neutral-600">
                  <input type="checkbox" name="gorselSil" />
                  Görseli kaldır
                </label>
              )}
              <span className="w-16 text-xs text-neutral-500">{k._count.products} ürün</span>
              <button className="btn btn-soft px-4 py-2">Kaydet</button>
            </form>

            <form action={kategoriSil}>
              <input type="hidden" name="id" value={k.id} />
              <button className="px-3 py-2 text-sm font-medium text-red-600 hover:underline">Sil</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}