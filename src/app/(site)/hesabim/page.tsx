import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mevcutMusteri } from "@/lib/musteri";
import { DURUM_ADI, tl, type Durum } from "@/lib/siparis";

export const dynamic = "force-dynamic";

export default async function Siparislerim() {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim");

  const siparisler = await prisma.order.findMany({
    where: { userId: musteri.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Siparişlerim ({siparisler.length})</h2>

      {siparisler.length === 0 ? (
        <p className="py-10 text-center text-neutral-500">
          Henüz siparişin yok.{" "}
          <Link href="/" className="text-teal-700 hover:underline">
            Alışverişe başla
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {siparisler.map((s) => (
            <div key={s.id} className="border border-neutral-200 p-4 text-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">Sipariş #{s.id}</span>
                <span className="text-neutral-500">{s.createdAt.toLocaleDateString("tr-TR")}</span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">
                  {DURUM_ADI[s.status as Durum]}
                </span>
              </div>
              <ul className="mb-3 space-y-1 text-neutral-700">
                {s.items.map((it) => (
                  <li key={it.id}>
                    {it.productName} <span className="text-neutral-400">× {it.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                <span className="font-semibold">{tl(Number(s.total))}</span>
                <Link href={`/siparis-tamam/${s.code}`} className="text-teal-700 hover:underline">
                  Detay
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}