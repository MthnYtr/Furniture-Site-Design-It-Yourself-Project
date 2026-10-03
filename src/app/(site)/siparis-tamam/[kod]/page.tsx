import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { tl } from "@/lib/siparis";

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

  const adres = siparis.address as { il: string; ilce: string; adres: string };

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-light">Siparişin alındı</h1>
      <p className="mb-8 text-neutral-600">
        Sipariş numaran: <b>#{siparis.id}</b>. Ödeme ve teslimat için seninle iletişime
        geçeceğiz.
      </p>

      <div className="space-y-3 border border-neutral-200 p-5 text-sm">
        {siparis.items.map((it) => (
          <div key={it.id} className="flex justify-between">
            <span>
              {it.productName} <span className="text-neutral-400">× {it.quantity}</span>
            </span>
            <span>{tl(Number(it.unitPrice) * it.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-neutral-200 pt-3 text-lg font-semibold">
          <span>Toplam</span>
          <span>{tl(Number(siparis.total))}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-neutral-600">
        Teslimat adresi: {adres.adres}, {adres.ilce} / {adres.il}
      </p>

      <Link href="/" className="mt-8 inline-block text-teal-700 hover:underline">
        Alışverişe devam et
      </Link>
    </main>
  );
}