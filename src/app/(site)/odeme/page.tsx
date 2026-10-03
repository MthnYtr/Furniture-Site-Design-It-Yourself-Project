import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { tl } from "@/lib/siparis";
import { siparisVer } from "./actions";

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

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <form action={siparisVer} className="space-y-4">
          {hataMesaji && <p className="bg-red-50 p-3 text-sm text-red-600">{hataMesaji}</p>}

          <div>
            <label className={etiket}>Ad soyad *</label>
            <input name="fullName" required className={alan} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={etiket}>E-posta *</label>
              <input name="email" type="email" required className={alan} />
            </div>
            <div>
              <label className={etiket}>Telefon *</label>
              <input name="phone" type="tel" required placeholder="05XX XXX XX XX" className={alan} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={etiket}>İl *</label>
              <input name="il" required className={alan} />
            </div>
            <div>
              <label className={etiket}>İlçe *</label>
              <input name="ilce" required className={alan} />
            </div>
          </div>
          <div>
            <label className={etiket}>Açık adres *</label>
            <textarea name="adres" rows={3} required className={alan} />
          </div>
          <div>
            <label className={etiket}>Sipariş notu</label>
            <textarea name="note" rows={2} className={alan} />
          </div>

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