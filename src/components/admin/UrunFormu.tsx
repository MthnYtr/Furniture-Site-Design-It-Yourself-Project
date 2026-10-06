import Link from "next/link";
import Uyari from "@/components/Uyari";

type Kategori = { id: number; name: string };

export type FormUrun = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  type: "STANDARD" | "CONFIGURABLE";
  basePrice: number;
  salePrice: number | null;
  stock: number;
  isActive: boolean;
  categoryId: number;
  images: { id: number; url: string; sortOrder: number }[];
  ozellikler: string;
  boyutlar: string;
};

const etiket = "mb-1.5 block text-xs font-semibold text-neutral-600";
const kart = "rounded-lg border border-neutral-200 bg-white p-5 md:p-6";
const kartBaslik = "mb-4 text-sm font-bold uppercase tracking-wider";

const HATALAR: Record<string, { baslik: string; aciklama: string }> = {
  eksik: {
    baslik: "Eksik bilgi",
    aciklama: "Zorunlu alanları doldur (ad, kod, kategori, geçerli fiyat).",
  },
  tekrar: {
    baslik: "Ad veya kod zaten kullanılıyor",
    aciklama: "Bu ad/adres veya ürün kodu başka bir üründe var.",
  },
  genel: { baslik: "Kaydedilemedi", aciklama: "Kaydedilirken bir sorun oluştu." },
  siparisli: {
    baslik: "Ürün silinemedi",
    aciklama:
      "Bu ürün siparişlerde geçtiği için silinemez. Bunun yerine 'Yayında' kutusunu kaldırabilirsin.",
  },
};

export default function UrunFormu({
  kategoriler,
  urun,
  action,
  hata,
}: {
  kategoriler: Kategori[];
  urun?: FormUrun;
  action: (formData: FormData) => void | Promise<void>;
  hata?: string;
}) {
  const h = hata ? (HATALAR[hata] ?? HATALAR.genel) : null;

  return (
    <form action={action} className="max-w-4xl space-y-6">
      {h && (
        <Uyari tip="hata" baslik={h.baslik}>
          {h.aciklama}
        </Uyari>
      )}

      <section className={kart}>
        <h2 className={kartBaslik}>Temel bilgiler</h2>
        <div className="space-y-4">
          <div>
            <label className={etiket}>Ürün adı *</label>
            <input name="name" defaultValue={urun?.name} required className="input" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={etiket}>Ürün kodu (SKU) *</label>
              <input name="sku" defaultValue={urun?.sku} required className="input font-mono" />
            </div>
            <div>
              <label className={etiket}>Adres (boşsa addan üretilir)</label>
              <input name="slug" defaultValue={urun?.slug} className="input" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={etiket}>Kategori *</label>
              <select name="categoryId" defaultValue={urun?.categoryId} required className="input">
                <option value="">Seç...</option>
                {kategoriler.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={etiket}>Ürün tipi</label>
              <select name="type" defaultValue={urun?.type ?? "STANDARD"} className="input">
                <option value="STANDARD">Standart ürün</option>
                <option value="CONFIGURABLE">Kendin Tasarla (yapılandırılabilir)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className={kart}>
        <h2 className={kartBaslik}>Fiyat ve stok</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={etiket}>Fiyat (TL) *</label>
            <input
              name="basePrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={urun?.basePrice}
              required
              className="input"
            />
          </div>
          <div>
            <label className={etiket}>İndirimli fiyat</label>
            <input
              name="salePrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={urun?.salePrice ?? ""}
              className="input"
            />
          </div>
          <div>
            <label className={etiket}>Stok</label>
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={urun?.stock ?? 0}
              className="input"
            />
          </div>
        </div>
        <p className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-xs text-brand-900">
          Seçenekli üründe fiyat ve stok seçeneklerden otomatik hesaplanır. İndirim oranı bu iki
          fiyat alanından alınır.
        </p>
      </section>

      <section className={kart}>
        <h2 className={kartBaslik}>Açıklama ve özellikler</h2>
        <div className="space-y-4">
          <div>
            <label className={etiket}>Açıklama</label>
            <textarea
              name="description"
              rows={5}
              defaultValue={urun?.description ?? ""}
              className="input"
            />
          </div>
          <div>
            <label className={etiket}>Ürün özellikleri</label>
            <textarea
              name="ozellikler"
              rows={4}
              defaultValue={urun?.ozellikler ?? ""}
              placeholder={"Her satıra bir bilgi, iki nokta ile:\nMalzeme: Meşe kaplama\nRenk: Doğal ahşap"}
              className="input"
            />
          </div>
          <div>
            <label className={etiket}>Ürün boyutları</label>
            <textarea
              name="boyutlar"
              rows={3}
              defaultValue={urun?.boyutlar ?? ""}
              placeholder={"Genişlik: 80 cm\nYükseklik: 180 cm\nDerinlik: 30 cm"}
              className="input"
            />
          </div>
        </div>
      </section>

      <section className={kart}>
        <h2 className={kartBaslik}>Fotoğraflar</h2>

        {urun && urun.images.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {urun.images.map((g) => (
              <div key={g.id} className="overflow-hidden rounded-lg border border-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt="" className="aspect-4/3 w-full object-cover" />
                <div className="space-y-2 bg-neutral-50 p-2 text-xs">
                  <label className="flex items-center gap-1.5 text-red-700">
                    <input type="checkbox" name="silinecek" value={g.id} className="accent-red-600" />
                    Sil
                  </label>
                  <label className="flex items-center gap-1.5 text-neutral-600">
                    Sıra
                    <input
                      type="number"
                      name={`sira_${g.id}`}
                      defaultValue={g.sortOrder}
                      className="w-14 rounded border border-neutral-300 px-1.5 py-0.5"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        <label className={etiket}>Yeni fotoğraf ekle (jpg, png, webp)</label>
        <input
          name="gorseller"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-800 hover:file:bg-brand-100"
        />
        <p className="mt-2 text-xs text-neutral-500">
          İlk sıradaki (en küçük numaralı) fotoğraf ürün kartında görünür.
        </p>
      </section>

      <section className={kart}>
        <h2 className={kartBaslik}>Yayın</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={urun ? urun.isActive : true}
            className="accent-brand-700"
          />
          Yayında (sitede görünsün)
        </label>
      </section>

      <div className="sticky bottom-0 z-10 flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg">
        <button className="btn btn-primary px-8">KAYDET</button>
        <Link href="/admin/urunler" className="text-sm font-semibold text-neutral-600 hover:underline">
          Vazgeç
        </Link>
      </div>
    </form>
  );
}