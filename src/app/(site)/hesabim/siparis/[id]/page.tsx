import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mevcutMusteri } from "@/lib/musteri";
import { DURUMLAR, DURUM_ADI, tl, type Durum } from "@/lib/siparis";
import { siparisUrunBilgisi } from "@/lib/siparisUrunleri";
import { tasarimBilgisi } from "@/lib/tasarim/kayit";
import SiparisRozet from "@/components/SiparisRozet";
import { takipAdresi } from "@/lib/kargo";

export const dynamic = "force-dynamic";

const tarih = (d: Date) =>
  d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

export default async function SiparisDetayi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim");

  const id = Number((await params).id);
  if (!id) notFound();

  const s = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  // Başkasının siparişi görünmesin
  if (!s || s.userId !== musteri.id) notFound();

  const bilgi = await siparisUrunBilgisi(s.items.map((i) => i.productId));
  const adres = s.address as { il: string; ilce: string; adres: string };

  const iptal = String(s.status) === "CANCELLED";
  const takipLink = takipAdresi(s.cargoCompany);
  const adimlar = DURUMLAR.filter((d) => String(d) !== "CANCELLED");
  const aktifIndex = adimlar.findIndex((d) => String(d) === String(s.status));

  return (
    <div>
      <Link href="/hesabim" className="text-sm font-semibold text-brand-700 hover:underline">
        &larr; Siparişlerim
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Sipariş #{s.id}</h2>
          <p className="text-sm text-neutral-500">{tarih(s.createdAt)} tarihinde verildi</p>
        </div>
        <SiparisRozet durum={s.status} />
      </div>

      <div className="mt-5 rounded-lg border border-neutral-200 bg-white p-5">
        {iptal ? (
          <p className="text-sm font-semibold text-red-700">Bu sipariş iptal edildi.</p>
        ) : (
          <ol className="flex items-start">
            {adimlar.map((d, i) => {
              const bitti = i <= aktifIndex;
              return (
                <li key={String(d)} className="relative flex flex-1 flex-col items-center text-center">
                  {i > 0 && (
                    <span
                      className={`absolute right-1/2 top-3 h-0.5 w-full ${
                        i <= aktifIndex ? "bg-brand-700" : "bg-neutral-200"
                      }`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                      bitti ? "bg-brand-700 text-white" : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {bitti ? "✓" : i + 1}
                  </span>
                  <span
                    className={`mt-2 text-[11px] font-semibold md:text-xs ${
                      bitti ? "text-neutral-800" : "text-neutral-400"
                    }`}
                  >
                    {DURUM_ADI[d as Durum]}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <h3 className="border-b border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold">
            Ürünler ({s.items.length})
          </h3>
          <ul className="divide-y divide-neutral-100">
            {s.items.map((it) => {
              const b = bilgi.get(it.productId);
              const cfg = it.config as { sku?: string } | null;
              const tsr = tasarimBilgisi(it.config);
              const kod = tsr ? "" : (cfg?.sku ?? b?.sku ?? "");
              const link = tsr ? tsr.adres : b?.aktif ? `/urun/${b.slug}` : null;

              const resim = (
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {tsr ? (
                    <div className="flex h-full w-full items-center justify-center bg-brand-50 text-[10px] font-bold text-brand-700">3D tasarım</div>
                  ) : (
                    b?.resim && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.resim} alt={it.productName} className="h-full w-full object-cover" />
                    )
                  )}
                </div>
              );

              return (
                <li key={it.id} className="flex items-center gap-4 p-4">
                  {link ? <Link href={link}>{resim}</Link> : resim}
                  <div className="min-w-0 flex-1 text-sm">
                    {link ? (
                      <Link href={link} className="font-semibold transition-colors hover:text-brand-700">
                        {it.productName}
                      </Link>
                    ) : (
                      <span className="font-semibold">{it.productName}</span>
                    )}
                    {tsr && <div className="mt-0.5 text-xs text-neutral-600">{tsr.ozet[0]}</div>}
                    {kod && (
                      <div className="mt-0.5 font-mono text-xs text-neutral-500">Ürün kodu: {kod}</div>
                    )}
                    <div className="mt-1 text-xs text-neutral-500">
                      {tl(Number(it.unitPrice))} × {it.quantity} adet
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-bold">
                    {tl(Number(it.unitPrice) * it.quantity)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

                <div className="space-y-5">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider">Teslimat adresi</h3>
            <div className="font-semibold">{s.fullName}</div>
            <div className="text-neutral-500">{s.phone}</div>
            <div className="mt-2 leading-6 text-neutral-700">
              {adres.adres}, {adres.ilce} / {adres.il}
            </div>
            {s.note && (
              <div className="mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                Notun: {s.note}
              </div>
            )}
          </div>

          {(s.cargoCompany || s.trackingCode) && (
            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider">Kargo bilgisi</h3>
              {s.cargoCompany && <div className="font-semibold">{s.cargoCompany}</div>}
              {s.trackingCode && (
                <div className="mt-1 text-neutral-700">
                  Takip no: <span className="font-mono font-semibold">{s.trackingCode}</span>
                </div>
              )}
              {s.shippedAt && (
                <div className="mt-1 text-xs text-neutral-500">
                  Kargoya veriliş: {tarih(s.shippedAt)}
                </div>
              )}
              {takipLink && (
                <a
                  href={takipLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline mt-3 w-full py-2"
                >
                  Kargom nerede?
                </a>
              )}
            </div>
          )}

          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider">Ödeme özeti</h3>
            <div className="flex justify-between">
              <span className="text-neutral-600">Ürünler</span>
              <span>{tl(Number(s.total))}</span>
            </div>
            <div className="mt-1 flex justify-between text-neutral-500">
              <span>Kargo</span>
              <span>Ayrıca bildirilir</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t border-neutral-100 pt-3">
              <span className="font-semibold">Toplam</span>
              <span className="text-xl font-bold">{tl(Number(s.total))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}