import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { tl } from "@/lib/siparis";
import SiparisRozet from "@/components/SiparisRozet";

export const dynamic = "force-dynamic";

export default async function GenelBakis() {
  const [urun, yayinda, kategori, siparis, bekleyen, ciro, sonSiparisler, azStok] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 5 } },
        orderBy: { stock: "asc" },
        take: 6,
        select: { id: true, name: true, sku: true, stock: true },
      }),
    ]);

  const kutular = [
    { baslik: "Toplam ciro", deger: tl(Number(ciro._sum.total ?? 0)), alt: "İptaller hariç", href: "/admin/siparisler" },
    { baslik: "Bekleyen sipariş", deger: String(bekleyen), alt: `${siparis} siparişin içinde`, href: "/admin/siparisler", vurgu: bekleyen > 0 },
    { baslik: "Yayındaki ürün", deger: String(yayinda), alt: `${urun} ürünün içinde`, href: "/admin/urunler" },
    { baslik: "Kategori", deger: String(kategori), alt: "Toplam", href: "/admin/kategoriler" },
  ];

  const tarih = (d: Date) =>
    d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="max-w-6xl">
      <h1 className="mb-6 text-2xl font-bold">Genel Bakış</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kutular.map((k) => (
          <Link
            key={k.baslik}
            href={k.href}
            className={`rounded-lg border bg-white p-5 transition hover:shadow-md ${
              k.vurgu ? "border-amber-300 bg-amber-50" : "border-neutral-200"
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {k.baslik}
            </div>
            <div className="mt-2 text-2xl font-bold md:text-3xl">{k.deger}</div>
            <div className="mt-1 text-xs text-neutral-500">{k.alt}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider">Son siparişler</h2>
            <Link href="/admin/siparisler" className="text-xs font-semibold text-brand-700 hover:underline">
              Tümünü gör
            </Link>
          </div>
          {sonSiparisler.length === 0 ? (
            <p className="p-5 text-sm text-neutral-500">Henüz sipariş yok.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {sonSiparisler.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/admin/siparisler/${s.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-neutral-50"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold">
                        #{s.id} · {s.fullName}
                      </div>
                      <div className="text-xs text-neutral-500">{tarih(s.createdAt)}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold">{tl(Number(s.total))}</span>
                      <SiparisRozet durum={s.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider">Stoğu azalan ürünler</h2>
          </div>
          {azStok.length === 0 ? (
            <p className="p-5 text-sm text-neutral-500">Stoğu azalan ürün yok.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {azStok.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/admin/urunler/${u.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-neutral-50"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{u.name}</div>
                      <div className="font-mono text-xs text-neutral-400">{u.sku}</div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        u.stock <= 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {u.stock <= 0 ? "Tükendi" : `${u.stock} adet`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}