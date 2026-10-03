import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { tl } from "@/lib/siparis";
import { siparisVer } from "./actions";
import Link from "next/link";
import { mevcutMusteri } from "@/lib/musteri";
import AdresSecici from "@/components/AdresSecici";

export const dynamic = "force-dynamic";

const alan = "w-full border border-neutral-300 px-3 py-2 text-sm";
const etiket = "mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600";

export default async function OdemeSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; urun?: string }>;
}) {
  const { hata, urun } = await searchParams;
  const sepet = await getCart();
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
  if (sepet.length === 0) redirect("/sepet");

  const urunler = await prisma.product.findMany({
    where: { id: { in: sepet.map((x) => x.id) }, isActive: true },
  });

  const satirlar = sepet.flatMap((s) => {
    const u = urunler.find((x) => x.id === s.id);
    if (!u) return [];
    const fiyat = Number(u.salePrice ?? u.basePrice);
    return [{ u, q: s.q, toplam: fiyat * s.q }];
  });
  if (sepet.length > 0 && satirlar.some((s) => s.u.stock < s.q)) {
    redirect("/sepet?hata=stok");
  }
  const genelToplam = satirlar.reduce((t, s) => t + s.toplam, 0);

  const hataMesaji =
    hata === "eksik"
      ? "Lütfen tüm zorunlu alanları doğru doldur."
      : hata === "stok"
        ? `"${urun}" için yeterli stok kalmadı. Sepetindeki adedi düşürüp tekrar dene.`
        : hata
          ? "Sipariş oluşturulurken bir sorun oluştu, lütfen tekrar dene."
          : null;

  return (
    <main className="mx-auto max-w-330 px-4 py-8">
      <h1 className="mb-6 text-3xl font-light">Teslimat bilgileri</h1>
        {!musteri && (
        <p className="mb-6 text-sm text-neutral-600">
          Üye misin?{" "}
          <Link href="/uye/giris?next=/odeme" className="text-teal-700 hover:underline">
            Giriş yap
          </Link>{" "}
          ve bilgilerin otomatik dolsun. Üye olmadan da sipariş verebilirsin.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <form action={siparisVer} className="space-y-4">
          {hataMesaji && <p className="bg-red-50 p-3 text-sm text-red-600">{hataMesaji}</p>}
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

          <div>
            <label className={etiket}>Ad soyad *</label>
            <input name="fullName" defaultValue={baslangic.fullName} required className={alan} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={etiket}>E-posta *</label>
              <input name="email" type="email" defaultValue={musteri?.email ?? ""} required className={alan} />
            </div>
            <div>
              <label className={etiket}>Telefon *</label>
              <input name="phone" type="tel" defaultValue={baslangic.phone} required placeholder="05XX XXX XX XX" className={alan} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={etiket}>İl *</label>
              <input name="il" defaultValue={baslangic.il} required className={alan} />
            </div>
            <div>
              <label className={etiket}>İlçe *</label>
              <input name="ilce" defaultValue={baslangic.ilce} required className={alan} />
            </div>
          </div>
          <div>
            <label className={etiket}>Açık adres *</label>
            <textarea name="adres" rows={3} defaultValue={baslangic.adres} required className={alan} />
          </div>
          <div>
            <label className={etiket}>Sipariş notu</label>
            <textarea name="note" rows={2} className={alan} />
          </div>

          {musteri && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="adresKaydet" /> Bu adresi hesabıma kaydet
            </label>
          )}
          
          <p className="text-xs text-neutral-500">
            Online ödeme yakında eklenecek. Siparişin alındıktan sonra ödeme bilgisi için
            seninle iletişime geçeceğiz.
          </p>

          <button className="bg-teal-700 px-8 py-3 text-sm font-bold tracking-wide text-white hover:bg-teal-800">
            SİPARİŞİ TAMAMLA
          </button>
        </form>

        <aside className="h-fit border border-neutral-200 p-5 text-sm">
          <h2 className="mb-4 font-semibold uppercase tracking-wide">Sipariş özeti</h2>
          <ul className="space-y-2">
            {satirlar.map(({ u, q, toplam }) => (
              <li key={u.id} className="flex justify-between gap-3">
                <span>
                  {u.name} <span className="text-neutral-400">× {q}</span>
                </span>
                <span>{tl(toplam)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-lg font-semibold">
            <span>Toplam</span>
            <span>{tl(genelToplam)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}