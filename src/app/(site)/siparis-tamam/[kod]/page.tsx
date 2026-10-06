import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mevcutMusteri } from "@/lib/musteri";
import { tl } from "@/lib/siparis";
import { siparisUrunBilgisi } from "@/lib/siparisUrunleri";

export const dynamic = "force-dynamic";

export default async function SiparisTamam({
  params,
}: {
  params: Promise<{ kod: string }>;
}) {
  const { kod } = await params;
  const siparis = await prisma.order.findUnique({
    where: { code: kod },
    include: { items: true },
  });
  if (!siparis) notFound();

  const musteri = await mevcutMusteri();
  const uyesi = !!musteri && siparis.userId === musteri.id;
  const bilgi = await siparisUrunBilgisi(siparis.items.map((i) => i.productId));
  const adres = siparis.address as { il: string; ilce: string; adres: string };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
          ✓
        </div>
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Siparişin alındı</h1>
        <p className="text-neutral-600">
          Sipariş numaran: <b>#{siparis.id}</b>. Ödeme ve teslimat için seninle iletişime
          geçeceğiz.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <ul className="divide-y divide-neutral-100">
          {siparis.items.map((it) => {
            const b = bilgi.get(it.productId);
            const cfg = it.config as { sku?: string } | null;
            const urunKodu = cfg?.sku ?? b?.sku ?? "";
            return (
              <li key={it.id} className="flex items-center gap-4 p-4">
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {b?.resim && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.resim} alt={it.productName} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <div className="font-semibold">{it.productName}</div>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    {urunKodu && <span className="mr-2 font-mono">{urunKodu}</span>}
                    {it.quantity} adet
                  </div>
                </div>
                <div className="shrink-0 text-sm font-semibold">
                  {tl(Number(it.unitPrice) * it.quantity)}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-baseline justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-4">
          <span className="font-semibold">Toplam</span>
          <span className="text-2xl font-bold">{tl(Number(siparis.total))}</span>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-neutral-200 bg-white p-4 text-sm">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider">Teslimat adresi</div>
        <div className="text-neutral-700">
          {siparis.fullName} · {adres.adres}, {adres.ilce} / {adres.il}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {uyesi && (
          <Link href={`/hesabim/siparis/${siparis.id}`} className="btn btn-primary px-8">
            Siparişimi Görüntüle
          </Link>
        )}
        <Link href="/" className="btn btn-outline px-8">
          Alışverişe Devam Et
        </Link>
      </div>
    </main>
  );
}