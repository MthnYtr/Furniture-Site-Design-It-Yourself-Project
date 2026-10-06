import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DURUM_ADI, tl, type Durum } from "@/lib/siparis";

export const dynamic = "force-dynamic";

export default async function SiparisListesi() {
  const siparisler = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-light">Siparişler ({siparisler.length})</h1>

      {siparisler.length === 0 ? (
        <p className="text-neutral-500">Henüz sipariş yok.</p>
      ) : (
        <table className="w-full bg-white text-sm shadow-sm">
          <thead className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Müşteri</th>
              <th className="p-3">Tarih</th>
              <th className="p-3">Ürün</th>
              <th className="p-3">Toplam</th>
              <th className="p-3">Durum</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {siparisler.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100">
                <td className="p-3 font-semibold">#{s.id}</td>
                <td className="p-3">
                  {s.fullName}
                  <span className="block text-xs text-neutral-400">{s.phone}</span>
                </td>
                <td className="p-3">{s.createdAt.toLocaleString("tr-TR")}</td>
                <td className="p-3">{s.items.reduce((t, i) => t + i.quantity, 0)} adet</td>
                <td className="p-3">{tl(Number(s.total))}</td>
                <td className="p-3">{DURUM_ADI[s.status as Durum]}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/siparisler/${s.id}`} className="text-brand-700 hover:underline">
                    Aç
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}