import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DURUMLAR, DURUM_ADI, tl, type Durum } from "@/lib/siparis";
import { KARGO_FIRMALARI, takipAdresi } from "@/lib/kargo";
import { durumGuncelle, kargoKaydet } from "../actions";
import { tasarimBilgisi } from "@/lib/tasarim/kayit";
import { kesimListesi } from "@/lib/tasarim/kesim";

export const dynamic = "force-dynamic";

const etiket = "mb-1 block text-xs font-semibold text-neutral-600";

function tarih(d: Date) {
  return d.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
}

export default async function SiparisDetay({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!id) notFound();

  const s = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!s) notFound();

  // Seçeneksiz ürünlerde kod, ürün kaydından alınır
  const urunler = await prisma.product.findMany({
    where: { id: { in: s.items.map((i) => i.productId) } },
    select: { id: true, sku: true },
  });
  const urunKodlari = new Map(urunler.map((u) => [u.id, u.sku]));

  const adres = s.address as { il: string; ilce: string; adres: string };
  const durum = String(s.status);
  const iptal = durum === "CANCELLED";
  const teslim = durum === "DELIVERED";
  const takipLink = takipAdresi(s.cargoCompany);

  const rozet =
    durum === "PENDING"
      ? "bg-amber-100 text-amber-800"
      : iptal
        ? "bg-red-100 text-red-700"
        : teslim
          ? "bg-emerald-100 text-emerald-800"
          : "bg-brand-100 text-brand-800";

  return (
    <div className="max-w-4xl">
      <Link href="/admin/siparisler" className="text-sm font-medium text-brand-700 hover:underline">
        ← Siparişler
      </Link>

      <div className="mb-6 mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Sipariş #{s.id}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${rozet}`}>
          {DURUM_ADI[s.status as Durum]}
        </span>
        <span className="text-sm text-neutral-500">{tarih(s.createdAt)}</span>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <div className="card p-5 text-sm">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">Müşteri</div>
          <div className="font-semibold">{s.fullName}</div>
          <div className="text-neutral-700">{s.email}</div>
          <div className="text-neutral-700">{s.phone}</div>
        </div>
        <div className="card p-5 text-sm">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">Teslimat adresi</div>
          <div>{adres.adres}</div>
          <div className="text-neutral-700">
            {adres.ilce} / {adres.il}
          </div>
          {s.note && (
            <div className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900">
              <span className="font-bold">Müşteri notu:</span> {s.note}
            </div>
          )}
        </div>
      </div>

      <div className="card mb-5 p-5 text-sm">
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">Ürünler</div>
        {s.items.map((it) => {
          const cfg = it.config as { variantName?: string; sku?: string } | null;
          const kod = cfg?.sku ?? urunKodlari.get(it.productId) ?? null;
          const tsr = tasarimBilgisi(it.config);
          const kesim = tsr ? kesimListesi(tsr.tur, tsr.sorgu) : null;
          return (
            <div key={it.id} className="flex items-start justify-between gap-4 border-b border-neutral-100 py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="font-medium">
                  {it.productName}
                  {cfg?.variantName ? ` (${cfg.variantName})` : ""}
                </div>
                <div className="mt-0.5 text-xs text-neutral-500">
                  {kod && <span className="font-mono font-semibold text-neutral-700">{kod}</span>}
                  {kod && " · "}
                  {it.quantity} adet × {tl(Number(it.unitPrice))}
                </div>
                {tsr && (
                  <div className="mt-2 rounded-lg border border-brand-200 bg-brand-50/50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded bg-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">Özel üretim</span>
                      <a
                        href={tsr.adres}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-brand-700 hover:underline"
                      >
                        Tasarımı 3D aç →
                      </a>
                    </div>
                    <ul className="mt-2 space-y-0.5 text-xs text-neutral-700">
                      {tsr.ozet.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                    {kesim && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs font-bold text-brand-800">
                          Kesim listesi ({kesim.satirlar.reduce((t, r) => t + r.adet, 0)} parça)
                        </summary>
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full min-w-[520px] text-left text-xs">
                            <thead className="text-neutral-500">
                              <tr className="border-b border-neutral-200">
                                <th className="py-1.5 pr-3 font-semibold">Malzeme</th>
                                <th className="py-1.5 pr-3 font-semibold">Parça</th>
                                <th className="py-1.5 pr-3 font-semibold">Ölçü</th>
                                <th className="py-1.5 pr-3 text-right font-semibold">Adet</th>
                                <th className="py-1.5 text-right font-semibold">Bant (m)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {kesim.satirlar.map((r) => (
                                <tr key={`${r.malzeme}-${r.ad}-${r.olcu}`} className="border-b border-neutral-100">
                                  <td className="py-1.5 pr-3 text-neutral-600">{r.malzeme}</td>
                                  <td className="py-1.5 pr-3">{r.ad}</td>
                                  <td className="py-1.5 pr-3 font-mono">{r.olcu}</td>
                                  <td className="py-1.5 pr-3 text-right font-semibold">{r.adet * it.quantity}</td>
                                  <td className="py-1.5 text-right">{r.bantM ? (r.bantM * it.quantity).toFixed(2) : "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {kesim.donanim.length > 0 && (
                            <p className="mt-2 text-xs text-neutral-600">
                              Donanım: {kesim.donanim.map((d) => `${d.ad} × ${d.adet * it.quantity}`).join(", ")}
                            </p>
                          )}
                          <p className="mt-1 text-[11px] text-neutral-500">
                            Adetler sipariş adedi ({it.quantity}) ile çarpılmıştır. Ölçüler mm, kalınlık malzeme sütununda.
                          </p>
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
              <div className="shrink-0 font-semibold">{tl(Number(it.unitPrice) * it.quantity)}</div>
            </div>
          );
        })}
        <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-lg font-bold">
          <span>Toplam</span>
          <span>{tl(Number(s.total))}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <form action={kargoKaydet} className="card space-y-4 p-5">
          <input type="hidden" name="id" value={s.id} />
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Kargo bilgisi</div>

          <div>
            <label className={etiket}>Kargo firması</label>
            <input
              name="company"
              list="kargo-firmalari"
              defaultValue={s.cargoCompany ?? ""}
              placeholder="Örn: Yurtiçi Kargo"
              className="input"
            />
            <datalist id="kargo-firmalari">
              {KARGO_FIRMALARI.map((f) => (
                <option key={f.ad} value={f.ad} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={etiket}>Takip numarası</label>
            <input name="trackingCode" defaultValue={s.trackingCode ?? ""} placeholder="Kargo takip no" className="input" />
          </div>

          {!iptal && !teslim && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="kargodaYap" />
              Kaydederken durumu da &quot;Kargoya verildi&quot; yap
            </label>
          )}

          {s.shippedAt && (
            <div className="text-xs text-neutral-500">Kargoya veriliş: {tarih(s.shippedAt)}</div>
          )}
          {takipLink && (
            <a href={takipLink} target="_blank" rel="noopener noreferrer" className="block text-xs font-medium text-brand-700 hover:underline">
              {s.cargoCompany} takip sayfasını aç →
            </a>
          )}

          <button className="btn btn-primary w-full py-2.5">Kargo bilgisini kaydet</button>
        </form>

        <form action={durumGuncelle} className="card space-y-4 p-5">
          <input type="hidden" name="id" value={s.id} />
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Sipariş durumu</div>

          <div>
            <label className={etiket}>Durum</label>
            <select name="status" defaultValue={s.status} disabled={iptal} className="input">
              {DURUMLAR.map((d) => (
                <option key={d} value={d}>
                  {DURUM_ADI[d]}
                </option>
              ))}
            </select>
          </div>

          {iptal ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              İptal edilen sipariş değiştirilemez.
            </p>
          ) : (
            <button className="btn btn-primary w-full py-2.5">Durumu kaydet</button>
          )}

          <p className="text-xs text-neutral-500">
            Siparişi iptal edersen ürünlerin stoku otomatik geri eklenir.
          </p>
        </form>
      </div>
    </div>
  );
}