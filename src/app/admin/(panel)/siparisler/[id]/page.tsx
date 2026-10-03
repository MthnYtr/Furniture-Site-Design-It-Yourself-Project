import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DURUMLAR, DURUM_ADI, tl, type Durum } from "@/lib/siparis";
import { durumGuncelle } from "../actions";

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

  const adres = s.address as { il: string; ilce: string; adres: string };
  const iptal = s.status === "CANCELLED";

  return (
    <div className="max-w-3xl">
      <Link href="/admin/siparisler" className="text-sm text-teal-700 hover:underline">
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
        {s.items.map((it) => (
          <div key={it.id} className="flex justify-between border-b border-neutral-100 py-2">
            <span>
              {it.productName} <span className="text-neutral-400">× {it.quantity}</span>
            </span>
            <span>{tl(Number(it.unitPrice) * it.quantity)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between text-lg font-semibold">
          <span>Toplam</span>
          <span>{tl(Number(s.total))}</span>
        </div>
      </div>

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
          <button className="bg-teal-700 px-5 py-2 text-sm font-bold text-white hover:bg-teal-800">
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