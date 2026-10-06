import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DURUMLAR, DURUM_ADI, tl, type Durum } from "@/lib/siparis";
import SiparisRozet from "@/components/SiparisRozet";

export const dynamic = "force-dynamic";

const SAYFA_BOYUTU = 20;
const BITEN = ["DELIVERED", "CANCELLED"];

export default async function SiparisListesi({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string; q?: string; sayfa?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const sayfa = Math.max(1, Number(sp.sayfa) || 1);

  const aktifDurumlar = DURUMLAR.filter((d) => !BITEN.includes(String(d)));
  const secilenDurum = DURUMLAR.find((d) => String(d) === sp.durum);
  // Varsayılan: sadece aktif siparişler
  const filtre = sp.durum === "tum" ? "tum" : secilenDurum ? String(secilenDurum) : "aktif";

  const durumKosulu =
    filtre === "tum"
      ? {}
      : secilenDurum
        ? { status: secilenDurum }
        : { status: { in: aktifDurumlar } };

  const aramaKosulu = q
    ? {
        OR: [
          ...(Number(q) ? [{ id: Number(q) }] : []),
          { fullName: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q } },
        ],
      }
    : {};

  const where = { ...durumKosulu, ...aramaKosulu };

  const [siparisler, toplamSayi, gruplar] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { select: { quantity: true } } },
      orderBy: { createdAt: "desc" },
      skip: (sayfa - 1) * SAYFA_BOYUTU,
      take: SAYFA_BOYUTU,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const sayiOf = (d: Durum) => gruplar.find((g) => g.status === d)?._count._all ?? 0;
  const aktifSayi = aktifDurumlar.reduce((t, d) => t + sayiOf(d), 0);
  const tumSayi = gruplar.reduce((t, g) => t + g._count._all, 0);

  const sekmeler = [
    { anahtar: "aktif", ad: "Aktif siparişler", sayi: aktifSayi },
    { anahtar: "tum", ad: "Tümü", sayi: tumSayi },
    ...DURUMLAR.map((d) => ({ anahtar: String(d), ad: DURUM_ADI[d as Durum], sayi: sayiOf(d) })),
  ];

  const href = (degisen: { durum?: string; sayfa?: number }) => {
    const p = new URLSearchParams();
    const d = degisen.durum ?? filtre;
    if (d !== "aktif") p.set("durum", d);
    if (q) p.set("q", q);
    if (degisen.sayfa && degisen.sayfa > 1) p.set("sayfa", String(degisen.sayfa));
    const s = p.toString();
    return s ? `/admin/siparisler?${s}` : "/admin/siparisler";
  };

  const sayfaSayisi = Math.max(1, Math.ceil(toplamSayi / SAYFA_BOYUTU));

  return (
    <div className="max-w-6xl">
      <h1 className="mb-6 text-2xl font-bold">Siparişler</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {sekmeler.map((s) => (
          <Link
            key={s.anahtar}
            href={href({ durum: s.anahtar })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
              s.anahtar === filtre
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-brand-600"
            }`}
          >
            {s.ad} <span className="opacity-70">({s.sayi})</span>
          </Link>
        ))}
      </div>

      <form method="get" className="mb-4 flex gap-2">
        {filtre !== "aktif" && <input type="hidden" name="durum" value={filtre} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Sipariş no, müşteri adı, telefon veya e-posta..."
          className="input max-w-md"
        />
        <button className="btn btn-outline px-5 py-2.5">Ara</button>
        {q && (
          <Link href={href({}).replace(/([?&])q=[^&]*&?/, "$1").replace(/[?&]$/, "")} className="btn btn-soft px-4 py-2.5">
            Temizle
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full min-w-170 text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
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
            {siparisler.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-neutral-500">
                  {q || filtre !== "aktif"
                    ? "Bu filtreye uygun sipariş bulunamadı."
                    : "Şu an aktif sipariş yok."}
                </td>
              </tr>
            )}
            {siparisler.map((s) => (
              <tr
                key={s.id}
                className={`border-b border-neutral-100 last:border-0 hover:bg-neutral-50 ${
                  String(s.status) === "PENDING" ? "bg-amber-50/50" : ""
                }`}
              >
                <td className="p-3 font-bold">
                  <Link href={`/admin/siparisler/${s.id}`} className="hover:text-brand-700">
                    #{s.id}
                  </Link>
                </td>
                <td className="p-3">
                  <span className="font-semibold">{s.fullName}</span>
                  <span className="block text-xs text-neutral-400">{s.phone}</span>
                </td>
                <td className="p-3 text-neutral-600">
                  {s.createdAt.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="p-3">{s.items.reduce((t, i) => t + i.quantity, 0)} adet</td>
                <td className="p-3 font-semibold">{tl(Number(s.total))}</td>
                <td className="p-3">
                  <SiparisRozet durum={s.status} />
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/siparisler/${s.id}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    Aç
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sayfaSayisi > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            Sayfa {sayfa} / {sayfaSayisi} · {toplamSayi} sipariş
          </span>
          <div className="flex gap-2">
            {sayfa > 1 && (
              <Link href={href({ sayfa: sayfa - 1 })} className="btn btn-outline px-4 py-2">
                &larr; Önceki
              </Link>
            )}
            {sayfa < sayfaSayisi && (
              <Link href={href({ sayfa: sayfa + 1 })} className="btn btn-outline px-4 py-2">
                Sonraki &rarr;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}