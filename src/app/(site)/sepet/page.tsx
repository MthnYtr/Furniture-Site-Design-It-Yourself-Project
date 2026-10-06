import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { birimFiyat } from "@/lib/fiyat";
import Uyari from "@/components/Uyari";
import { adetDegistir, urunCikar } from "./actions";

export const dynamic = "force-dynamic";

const tl = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";

const adetDugme =
  "flex h-9 w-9 items-center justify-center text-lg transition-colors hover:bg-neutral-100";

export default async function SepetSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  const { hata } = await searchParams;
  const sepet = await getCart();

  const urunler = await prisma.product.findMany({
    where: { id: { in: sepet.map((x) => x.id) }, isActive: true },
    include: {
      variants: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  const satirlar = sepet.flatMap((s) => {
    const u = urunler.find((x) => x.id === s.id);
    if (!u) return [];
    const varyant = s.v ? u.variants.find((x) => x.id === s.v) : undefined;
    // Seçeneği olan üründe geçerli bir seçenek yoksa (silinmiş) satırı gösterme
    if (u.variants.length > 0 && !varyant) return [];

    const stok = varyant ? varyant.stock : u.stock;
    const fiyat = birimFiyat(u, varyant);
    return [{ u, varyant, q: s.q, fiyat, toplam: fiyat * s.q, stok, sorun: stok < s.q }];
  });

  const genelToplam = satirlar.reduce((t, s) => t + s.toplam, 0);
  const toplamAdet = satirlar.reduce((t, s) => t + s.q, 0);
  const sorunVar = satirlar.some((s) => s.sorun);

  if (satirlar.length === 0) {
    return (
      <main className="mx-auto max-w-330 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-md rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center">
          <svg
            viewBox="0 0 24 24"
            className="mx-auto mb-4 h-14 w-14 text-brand-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4h2.5l2.2 11h10.6L20.5 8H6.4" />
            <circle cx="9" cy="19.5" r="1.3" />
            <circle cx="17" cy="19.5" r="1.3" />
          </svg>
          <h1 className="mb-2 text-2xl font-bold">Sepetin boş</h1>
          <p className="mb-6 text-sm text-neutral-500">
            Beğendiğin ürünleri sepete ekleyerek alışverişe başlayabilirsin.
          </p>
          <Link href="/" className="btn btn-primary px-8">
            Alışverişe Başla
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-330 px-4 py-6 md:py-10">
      <h1 className="mb-1 text-2xl font-bold md:text-3xl">Sepetim</h1>
      <p className="mb-6 text-sm text-neutral-500">{toplamAdet} ürün</p>

      {hata === "sinir" && (
        <Uyari tip="uyari" baslik="Daha fazla eklenemiyor">
          Bu üründen eklenebilecek en fazla adede ulaştın.
        </Uyari>
      )}
      {hata === "stok" && (
        <Uyari tip="hata" baslik="Bazı ürünlerin stoğu yetersiz">
          Aşağıdaki uyarılara göre adetleri düzenleyip tekrar dene.
        </Uyari>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="space-y-3">
          {satirlar.map(({ u, varyant, q, fiyat, toplam, stok, sorun }) => (
            <div
              key={`${u.id}-${varyant?.id ?? 0}`}
              className={`flex gap-4 rounded-lg border bg-white p-4 ${
                sorun ? "border-red-300" : "border-neutral-200"
              }`}
            >
              <Link
                href={`/urun/${u.slug}`}
                className="block h-24 w-28 shrink-0 overflow-hidden rounded-md bg-neutral-100 md:h-28 md:w-36"
              >
                {u.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.images[0].url} alt={u.name} className="h-full w-full object-cover" />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/urun/${u.slug}`}
                  className="line-clamp-2 font-semibold transition-colors hover:text-brand-700"
                >
                  {u.name}
                </Link>
                {varyant && (
                  <span className="mt-1 inline-block rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                    {varyant.name}
                  </span>
                )}
                <div className="mt-1 font-mono text-[11px] text-neutral-400">
                  {varyant?.sku ?? u.sku}
                </div>
                <div className="mt-1 text-sm text-neutral-600">{tl(fiyat)}</div>

                {sorun && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    {stok <= 0
                      ? "Bu ürün tükendi, sepetten kaldırman gerekiyor."
                      : "Bu adet kadar stok yok, adedi azaltman gerekiyor."}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center overflow-hidden rounded-md border border-neutral-300">
                    <form action={adetDegistir}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="v" value={varyant?.id ?? ""} />
                      <input type="hidden" name="fark" value="-1" />
                      <button aria-label="Azalt" className={adetDugme}>
                        −
                      </button>
                    </form>
                    <span className="w-10 text-center text-sm font-semibold">{q}</span>
                    <form action={adetDegistir}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="v" value={varyant?.id ?? ""} />
                      <input type="hidden" name="fark" value="1" />
                      <button aria-label="Artır" className={adetDugme}>
                        +
                      </button>
                    </form>
                  </div>

                  <div className="text-lg font-bold">{tl(toplam)}</div>

                  <form action={urunCikar}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="v" value={varyant?.id ?? ""} />
                    <button
                      aria-label="Sepetten kaldır"
                      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
                      </svg>
                      Kaldır
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/"
            className="inline-block pt-2 text-sm font-semibold text-brand-700 hover:underline"
          >
            &larr; Alışverişe devam et
          </Link>
        </div>

        <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-5 lg:sticky lg:top-36">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">Sipariş özeti</h2>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Ara toplam</span>
            <span className="font-medium">{tl(genelToplam)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-neutral-500">
            <span>Kargo</span>
            <span>Ödeme adımında hesaplanır</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-neutral-200 pt-4">
            <span className="font-semibold">Toplam</span>
            <span className="text-2xl font-bold">{tl(genelToplam)}</span>
          </div>

          {sorunVar ? (
            <>
              <button
                disabled
                className="btn mt-5 w-full cursor-not-allowed bg-neutral-300 py-3.5 text-white"
              >
                SİPARİŞİ TAMAMLA
              </button>
              <p className="mt-2 text-center text-xs text-red-600">
                Önce uyarı alan ürünleri düzenle.
              </p>
            </>
          ) : (
            <Link href="/odeme" className="btn btn-primary mt-5 w-full py-3.5">
              SİPARİŞİ TAMAMLA
            </Link>
          )}

          <ul className="mt-5 space-y-2 border-t border-neutral-100 pt-4 text-xs text-neutral-600">
            {["Hızlı teslimat", "Kurulum hizmeti", "2 yıl garanti"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-brand-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}