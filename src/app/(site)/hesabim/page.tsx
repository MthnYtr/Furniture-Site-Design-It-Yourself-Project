import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mevcutMusteri } from "@/lib/musteri";
import { tl } from "@/lib/siparis";
import { siparisUrunBilgisi } from "@/lib/siparisUrunleri";
import SiparisRozet from "@/components/SiparisRozet";

export const dynamic = "force-dynamic";

const tarih = (d: Date) =>
  d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

export default async function Siparislerim() {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim");

  const siparisler = await prisma.order.findMany({
    where: { userId: musteri.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const bilgi = await siparisUrunBilgisi(
    siparisler.flatMap((s) => s.items.map((i) => i.productId)),
  );

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Siparişlerim ({siparisler.length})</h2>

      {siparisler.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-14 text-center">
          <p className="mb-4 text-sm text-neutral-600">Henüz siparişin yok.</p>
          <Link href="/" className="btn btn-primary">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {siparisler.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
                <div className="text-sm">
                  <span className="font-bold">Sipariş No: #{s.id}</span>
                  <span className="ml-3 text-neutral-500">{tarih(s.createdAt)}</span>
                </div>
                <SiparisRozet durum={s.status} />
              </div>

              <ul className="divide-y divide-neutral-100">
                {s.items.map((it) => {
                  const b = bilgi.get(it.productId);
                  const cfg = it.config as { sku?: string } | null;
                  const kod = cfg?.sku ?? b?.sku ?? "";
                  const link = b?.aktif ? `/urun/${b.slug}` : null;

                  const resim = (
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                      {b?.resim && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.resim} alt={it.productName} className="h-full w-full object-cover" />
                      )}
                    </div>
                  );

                  return (
                    <li key={it.id} className="flex items-center gap-4 px-4 py-3">
                      {link ? <Link href={link}>{resim}</Link> : resim}
                      <div className="min-w-0 flex-1 text-sm">
                        {link ? (
                          <Link href={link} className="font-semibold transition-colors hover:text-brand-700">
                            {it.productName}
                          </Link>
                        ) : (
                          <span className="font-semibold">{it.productName}</span>
                        )}
                        <div className="mt-0.5 text-xs text-neutral-500">
                          {kod && <span className="mr-2 font-mono">{kod}</span>}
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

              <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
                <div className="text-sm">
                  <span className="text-neutral-500">Toplam: </span>
                  <span className="text-base font-bold">{tl(Number(s.total))}</span>
                </div>
                <Link href={`/hesabim/siparis/${s.id}`} className="btn btn-outline px-5 py-2">
                  Sipariş detayı
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}