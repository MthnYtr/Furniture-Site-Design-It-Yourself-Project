import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { mevcutMusteri } from "@/lib/musteri";
import { tl } from "@/lib/siparis";
import { birimFiyat } from "@/lib/fiyat";
import AdresSecici from "@/components/AdresSecici";
import Uyari from "@/components/Uyari";
import { siparisVer } from "./actions";

export const dynamic = "force-dynamic";

const etiket = "mb-1.5 block text-xs font-semibold text-neutral-600";

function Adimlar() {
  const adimlar = [
    { ad: "Sepet", durum: "bitti" },
    { ad: "Teslimat", durum: "aktif" },
    { ad: "Sipariş tamam", durum: "bekliyor" },
  ] as const;
  return (
    <ol className="mb-8 flex items-center gap-2 text-xs font-semibold md:gap-3 md:text-sm">
      {adimlar.map((a, i) => (
        <li key={a.ad} className="flex items-center gap-2 md:gap-3">
          {i > 0 && <span className="h-px w-4 bg-neutral-300 md:w-8" />}
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
              a.durum === "aktif"
                ? "bg-brand-700 text-white"
                : a.durum === "bitti"
                  ? "bg-brand-100 text-brand-800"
                  : "bg-neutral-200 text-neutral-500"
            }`}
          >
            {a.durum === "bitti" ? "✓" : i + 1}
          </span>
          <span className={a.durum === "bekliyor" ? "text-neutral-400" : "text-neutral-800"}>
            {a.ad}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default async function OdemeSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; urun?: string }>;
}) {
  const { hata, urun } = await searchParams;
  const sepet = await getCart();
  if (sepet.length === 0) redirect("/sepet");

  const musteri = await mevcutMusteri();
  const sonSiparis = musteri
    ? await prisma.order.findFirst({
        where: { userId: musteri.id },
        orderBy: { createdAt: "desc" },
      })
    : null;
  const sonAdres = sonSiparis?.address as
    | { il: string; ilce: string; adres: string }
    | undefined;

  const adresler = musteri
    ? await prisma.address.findMany({
        where: { userId: musteri.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    : [];
  const varsayilan = adresler[0] ?? null;
  const baslangic = {
    fullName: varsayilan?.fullName ?? musteri?.name ?? "",
    phone: varsayilan?.phone ?? musteri?.phone ?? sonSiparis?.phone ?? "",
    il: varsayilan?.il ?? sonAdres?.il ?? "",
    ilce: varsayilan?.ilce ?? sonAdres?.ilce ?? "",
    adres: varsayilan?.adres ?? sonAdres?.adres ?? "",
  };

  const urunler = await prisma.product.findMany({
    where: { id: { in: sepet.map((x) => x.id) }, isActive: true },
    include: { variants: true },
  });

  const satirlar = sepet.flatMap((s) => {
    const u = urunler.find((x) => x.id === s.id);
    if (!u) return [];
    const varyant = s.v ? u.variants.find((x) => x.id === s.v) : undefined;
    if (u.variants.length > 0 && !varyant) return [];

    const stok = varyant ? varyant.stock : u.stock;
    const fiyat = birimFiyat(u, varyant);
    return [{ u, varyant, q: s.q, toplam: fiyat * s.q, yetersiz: stok < s.q }];
  });

  if (satirlar.length === 0) redirect("/sepet");
  if (satirlar.some((s) => s.yetersiz)) redirect("/sepet?hata=stok");

  const genelToplam = satirlar.reduce((t, s) => t + s.toplam, 0);

  return (
    <main className="mx-auto max-w-330 px-4 py-6 md:py-10">
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">Teslimat bilgileri</h1>
      <Adimlar />

      {!musteri && (
        <div className="mb-6 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          Üye misin?{" "}
          <Link href="/uye/giris?next=/odeme" className="font-bold underline">
            Giriş yap
          </Link>{" "}
          ve bilgilerin otomatik dolsun. Üye olmadan da sipariş verebilirsin.
        </div>
      )}

      {hata === "eksik" && (
        <Uyari tip="hata" baslik="Eksik veya hatalı bilgi">
          Lütfen yıldızlı (*) alanları doğru doldur.
        </Uyari>
      )}
      {hata === "stok" && (
        <Uyari tip="hata" baslik="Stok yetersiz">
          &quot;{urun}&quot; için yeterli stok kalmadı. Sepetindeki adedi düşürüp tekrar dene.
        </Uyari>
      )}
      {hata && hata !== "eksik" && hata !== "stok" && (
        <Uyari tip="hata" baslik="Sipariş oluşturulamadı">
          Bir sorun oluştu, lütfen tekrar dene.
        </Uyari>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <form action={siparisVer} className="space-y-6">
          {adresler.length > 0 && (
            <AdresSecici
              adresler={adresler.map((a) => ({
                id: a.id,
                title: a.title,
                fullName: a.fullName,
                phone: a.phone,
                il: a.il,
                ilce: a.ilce,
                adres: a.adres,
              }))}
            />
          )}

          <section className="rounded-lg border border-neutral-200 bg-white p-5 md:p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">İletişim bilgileri</h2>
            <div className="space-y-4">
              <div>
                <label className={etiket}>Ad soyad *</label>
                <input name="fullName" defaultValue={baslangic.fullName} required className="input" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={etiket}>E-posta *</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={musteri?.email ?? ""}
                    required
                    className="input"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    E-posta adreslerinde Türkçe karakter (ş, ı, ğ, ü, ö, ç) kullanılamaz.
                  </p>
                </div>
                <div>
                  <label className={etiket}>Telefon *</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={baslangic.phone}
                    required
                    placeholder="05XX XXX XX XX"
                    className="input"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-5 md:p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">Teslimat adresi</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={etiket}>İl *</label>
                  <input name="il" defaultValue={baslangic.il} required className="input" />
                </div>
                <div>
                  <label className={etiket}>İlçe *</label>
                  <input name="ilce" defaultValue={baslangic.ilce} required className="input" />
                </div>
              </div>
              <div>
                <label className={etiket}>Açık adres *</label>
                <textarea name="adres" rows={3} defaultValue={baslangic.adres} required className="input" />
              </div>
              <div>
                <label className={etiket}>Sipariş notu</label>
                <textarea name="note" rows={2} placeholder="Teslimat için eklemek istediğin bir not" className="input" />
              </div>

              {musteri && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="adresKaydet" className="accent-brand-700" />
                  Bu adresi hesabıma kaydet
                </label>
              )}
            </div>
          </section>

          <div className="rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-xs text-brand-900">
            Online ödeme yakında eklenecek. Siparişin alındıktan sonra ödeme bilgisi için seninle
            iletişime geçeceğiz.
          </div>

          <button className="btn btn-primary w-full px-10 py-4 md:w-auto">SİPARİŞİ TAMAMLA</button>
        </form>

        <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-5 text-sm lg:sticky lg:top-36">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">Sipariş özeti</h2>
          <ul className="divide-y divide-neutral-100">
            {satirlar.map(({ u, varyant, q, toplam }) => (
              <li key={`${u.id}-${varyant?.id ?? 0}`} className="flex justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <div className="font-medium">
                    {u.name}
                    {varyant ? ` (${varyant.name})` : ""}
                  </div>
                  <div className="mt-0.5 flex gap-2 text-xs text-neutral-500">
                    <span className="font-mono">{varyant?.sku ?? u.sku}</span>
                    <span>· {q} adet</span>
                  </div>
                </div>
                <span className="shrink-0 font-semibold">{tl(toplam)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-baseline justify-between border-t border-neutral-200 pt-4">
            <span className="font-semibold">Toplam</span>
            <span className="text-2xl font-bold">{tl(genelToplam)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}