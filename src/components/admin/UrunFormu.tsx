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
  images: { id: number; url: string }[];
};

const alan = "w-full border border-neutral-300 bg-white px-3 py-2 text-sm";
const etiket = "mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600";

const HATALAR: Record<string, string> = {
  eksik: "Zorunlu alanları doldur (ad, SKU, kategori, geçerli fiyat).",
  tekrar: "Bu ad/adres veya SKU başka bir üründe kullanılıyor.",
  genel: "Kaydedilirken bir sorun oluştu.",
  siparisli:
    "Bu ürün siparişlerde geçtiği için silinemez. Bunun yerine 'Yayında' kutusunu kaldırabilirsin.",
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
  return (
    <form action={action} className="max-w-3xl space-y-5 bg-white p-6 shadow-sm">
      {hata && (
        <p className="bg-red-50 p-3 text-sm text-red-600">{HATALAR[hata] ?? HATALAR.genel}</p>
      )}

      <div>
        <label className={etiket}>Ürün adı *</label>
        <input name="name" defaultValue={urun?.name} required className={alan} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={etiket}>SKU (stok kodu) *</label>
          <input name="sku" defaultValue={urun?.sku} required className={alan} />
        </div>
        <div>
          <label className={etiket}>Adres (boşsa addan üretilir)</label>
          <input name="slug" defaultValue={urun?.slug} className={alan} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={etiket}>Kategori *</label>
          <select name="categoryId" defaultValue={urun?.categoryId} required className={alan}>
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
          <select name="type" defaultValue={urun?.type ?? "STANDARD"} className={alan}>
            <option value="STANDARD">Standart ürün</option>
            <option value="CONFIGURABLE">Kendin Tasarla (yapılandırılabilir)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={etiket}>Fiyat (TL) *</label>
          <input
            name="basePrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={urun?.basePrice}
            required
            className={alan}
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
            className={alan}
          />
        </div>
        <div>
          <label className={etiket}>Stok</label>
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={urun?.stock ?? 0}
            className={alan}
          />
        </div>
      </div>

      <div>
        <label className={etiket}>Açıklama</label>
        <textarea
          name="description"
          rows={5}
          defaultValue={urun?.description ?? ""}
          className={alan}
        />
      </div>

      <div>
        <label className={etiket}>Fotoğraflar (jpg, png, webp)</label>
        {urun && urun.images.length > 0 && (
          <div className="mb-3 grid grid-cols-4 gap-3">
            {urun.images.map((g) => (
              <label key={g.id} className="block text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt="" className="aspect-4/3 w-full object-cover" />
                <span className="mt-1 flex items-center gap-1">
                  <input type="checkbox" name="silinecek" value={g.id} /> Sil
                </span>
              </label>
            ))}
          </div>
        )}
        <input
          name="gorseller"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          className="text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={urun ? urun.isActive : true}
        />
        Yayında (sitede görünsün)
      </label>

      <div className="flex gap-3">
        <button className="bg-teal-700 px-6 py-2 text-sm font-bold text-white hover:bg-teal-800">
          KAYDET
        </button>
        <a href="/admin/urunler" className="px-6 py-2 text-sm text-neutral-600 hover:underline">
          Vazgeç
        </a>
      </div>
    </form>
  );
}