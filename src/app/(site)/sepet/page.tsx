import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { adetDegistir, urunCikar } from "./actions";

export const dynamic = "force-dynamic";

const tl = (n: number) =>
  n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";

export default async function SepetSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  const { hata } = await searchParams;
  const sepet = await getCart();

  const urunler = await prisma.product.findMany({
    where: { id: { in: sepet.map((x) => x.id) }, isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const satirlar = sepet.flatMap((s) => {
    const u = urunler.find((x) => x.id === s.id);
    if (!u) return [];
    const fiyat = Number(u.salePrice ?? u.basePrice);
    return [{ u, q: s.q, fiyat, toplam: fiyat * s.q, sorun: u.stock < s.q }];
  });

  const genelToplam = satirlar.reduce((t, s) => t + s.toplam, 0);
  const sorunVar = satirlar.some((s) => s.sorun);

  if (satirlar.length === 0) {
    return (
      <main className="mx-auto max-w-330 px-4 py-24 text-center">
        <h1 className="mb-3 text-2xl font-light">Sepetin boş</h1>
        <Link href="/" className="text-teal-700 hover:underline">
          Alışverişe başla
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-330 px-4 py-8">
      <h1 className="mb-6 text-3xl font-light">Sepetim</h1>

      {hata === "sinir" && (
        <p className="mb-4 bg-amber-50 p-3 text-sm text-amber-800">
          Bu üründen daha fazla eklenemiyor.
        </p>
      )}
      {hata === "stok" && (
        <p className="mb-4 bg-red-50 p-3 text-sm text-red-600">
          Sepetindeki bazı ürünlerin stoğu yetersiz. Lütfen aşağıdaki uyarılara göre
          düzenleyip tekrar dene.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="divide-y divide-neutral-200 border border-neutral-200">
          {satirlar.map(({ u, q, fiyat, toplam, sorun }) => (
            <div key={u.id} className="flex items-center gap-4 p-4">
              <Link href={`/urun/${u.slug}`} className="block h-20 w-28 shrink-0 bg-neutral-100">
                {u.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.images[0].url} alt={u.name} className="h-full w-full object-cover" />
                )}
              </Link>

              <div className="flex-1">
                <Link href={`/urun/${u.slug}`} className="font-medium hover:text-teal-700">
                  {u.name}
                </Link>
                <div className="text-xs text-neutral-500">{u.sku}</div>
                <div className="mt-1 text-sm">{tl(fiyat)}</div>
                {sorun && (
                  <div className="mt-1 text-xs font-semibold text-red-600">
                    {u.stock <= 0
                      ? "Bu ürün tükendi, sepetten kaldırman gerekiyor."
                      : "Bu adet kadar stok yok, adedi azaltman gerekiyor."}
                  </div>
                )}
              </div>

              <div className="flex items-center border border-neutral-300">
                <form action={adetDegistir}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="fark" value="-1" />
                  <button className="px-3 py-1 hover:bg-neutral-100">−</button>
                </form>
                <span className="w-8 text-center text-sm">{q}</span>
                <form action={adetDegistir}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="fark" value="1" />
                  <button className="px-3 py-1 hover:bg-neutral-100">+</button>
                </form>
              </div>

              <div className="w-28 text-right font-semibold">{tl(toplam)}</div>

              <form action={urunCikar}>
                <input type="hidden" name="id" value={u.id} />
                <button className="px-2 text-sm text-red-600 hover:underline">Kaldır</button>
              </form>
            </div>
          ))}
        </div>

        <aside className="h-fit border border-neutral-200 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Sipariş özeti</h2>
          <div className="flex justify-between text-sm">
            <span>Ara toplam</span>
            <span>{tl(genelToplam)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-neutral-500">
            <span>Kargo</span>
            <span>Ödeme adımında hesaplanır</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-lg font-semibold">
            <span>Toplam</span>
            <span>{tl(genelToplam)}</span>
          </div>

          {sorunVar ? (
            <button
              disabled
              className="mt-5 w-full cursor-not-allowed bg-neutral-300 py-3 text-sm font-bold tracking-wide text-white"
            >
              SİPARİŞİ TAMAMLA
            </button>
          ) : (
            <Link
              href="/odeme"
              className="mt-5 block w-full bg-teal-700 py-3 text-center text-sm font-bold tracking-wide text-white hover:bg-teal-800"
            >
              SİPARİŞİ TAMAMLA
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}