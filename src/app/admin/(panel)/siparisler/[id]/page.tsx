import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DURUMLAR, DURUM_ADI, tl, type Durum } from "@/lib/siparis";
import { durumGuncelle, kargoKaydet } from "../actions";
import { KARGO_FIRMALARI } from "@/lib/kargo";

export const dynamic = "force-dynamic";

export default async function SiparisDetay({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!id) notFound();

  const s = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!s) notFound();

  // Seçeneksiz ürünlerde ve eski siparişlerde kod, üründen alınır
  const urunKodlari = new Map(
    (
      await prisma.product.findMany({
        where: { id: { in: s.items.map((it) => it.productId) } },
        select: { id: true, sku: true },
      })
    ).map((p) => [p.id, p.sku]),
  );

  const adres = s.address as { il: string; ilce: string; adres: string };
  const iptal = s.status === "CANCELLED";

  return (
    <div className="max-w-3xl">
      <Link href="/admin/siparisler" className="text-sm text-brand-700 hover:underline">
        ← Siparişler
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-light">Sipariş #{s.id}</h1>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="bg-white p-5 text-sm shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase text-neutral-500">Müşteri</div>
          <div className="font-medium">{s.fullName}</div>
          <div>{s.email}</div>
          <div>{s.phone}</div>
        </div>
        <div className="bg-white p-5 text-sm shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase text-neutral-500">Teslimat adresi</div>
          <div>{adres.adres}</div>
          <div>
            {adres.ilce} / {adres.il}
          </div>
          {s.note && <div className="mt-2 text-neutral-500">Not: {s.note}</div>}
        </div>
      </div>

      <div className="mb-6 bg-white p-5 text-sm shadow-sm">
        <div className="mb-3 text-xs font-semibold uppercase text-neutral-500">Ürünler</div>
        {s.items.map((it) => {
          const cfg = it.config as { sku?: string } | null;
          const kod = cfg?.sku ?? urunKodlari.get(it.productId) ?? "";
          return (
            <div key={it.id} className="flex justify-between gap-4 border-b border-neutral-100 py-2">
              <span>
                {it.productName}
                {kod && (
                  <>
                    {" · "}
                    <span className="font-mono text-xs font-semibold text-neutral-600">{kod}</span>
                  </>
                )}
                {" · "}
                <span className="text-neutral-500">{it.quantity} adet</span>
              </span>
              <span className="shrink-0">{tl(Number(it.unitPrice) * it.quantity)}</span>
            </div>
          );
        })}
        <div className="mt-3 flex justify-between text-lg font-semibold">
          <span>Toplam</span>
          <span>{tl(Number(s.total))}</span>
        </div>
      </div>
      
      <form action={kargoKaydet} className="mb-6 space-y-4 bg-white p-5 shadow-sm">
        <input type="hidden" name="id" value={s.id} />
        <div className="text-xs font-semibold uppercase text-neutral-500">Kargo bilgisi</div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-600">Kargo firması</label>
            <input
              name="company"
              list="kargo-firmalari"
              defaultValue={s.cargoCompany ?? ""}
              placeholder="Örn: Yurtiçi Kargo"
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
            <datalist id="kargo-firmalari">
              {KARGO_FIRMALARI.map((f) => (
                <option key={f.ad} value={f.ad} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-600">Takip numarası</label>
            <input
              name="trackingCode"
              defaultValue={s.trackingCode ?? ""}
              placeholder="Kargo takip no"
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {!iptal && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="kargodaYap" />
            Kaydederken sipariş durumunu da kargoya verildi yap
          </label>
        )}

        <button className="bg-brand-700 px-6 py-2 text-sm font-bold text-white hover:bg-brand-800">
          KARGO BİLGİSİNİ KAYDET
        </button>
      </form>
    
      <form action={durumGuncelle} className="flex items-center gap-3 bg-white p-5 shadow-sm">
        <input type="hidden" name="id" value={s.id} />
        <label className="text-sm font-semibold">Durum:</label>
        <select
          name="status"
          defaultValue={s.status}
          disabled={iptal}
          className="border border-neutral-300 px-3 py-2 text-sm"
        >
          {DURUMLAR.map((d) => (
            <option key={d} value={d}>
              {DURUM_ADI[d]}
            </option>
          ))}
        </select>
        {!iptal && (
          <button className="bg-brand-700 px-5 py-2 text-sm font-bold text-white hover:bg-brand-800">
            KAYDET
          </button>
        )}
        {iptal && (
          <span className="text-sm text-neutral-500">İptal edilen sipariş değiştirilemez.</span>
        )}
      </form>
      <p className="mt-2 text-xs text-neutral-500">
        Siparişi iptal edersen ürünlerin stoku otomatik geri eklenir.
      </p>
    </div>
  );
}