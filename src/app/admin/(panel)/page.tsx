import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GenelBakis() {
  const [urun, kategori, siparis] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
  ]);

  const kutular = [
    { baslik: "Ürün", sayi: urun },
    { baslik: "Kategori", sayi: kategori },
    { baslik: "Sipariş", sayi: siparis },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-light">Genel Bakış</h1>
      <div className="grid max-w-2xl grid-cols-3 gap-4">
        {kutular.map((k) => (
          <div key={k.baslik} className="bg-white p-6 shadow-sm">
            <div className="text-3xl font-semibold">{k.sayi}</div>
            <div className="text-sm text-neutral-500">{k.baslik}</div>
          </div>
        ))}
      </div>
    </div>
  );
}