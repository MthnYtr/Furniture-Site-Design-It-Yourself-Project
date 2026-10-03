import { prisma } from "@/lib/prisma";
import UrunFormu from "@/components/admin/UrunFormu";
import { kaydetUrun } from "../actions";

export const dynamic = "force-dynamic";

export default async function YeniUrun({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  const { hata } = await searchParams;
  const kategoriler = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-light">Yeni ürün</h1>
      <UrunFormu
        kategoriler={kategoriler}
        action={kaydetUrun.bind(null, null)}
        hata={hata}
      />
    </div>
  );
}