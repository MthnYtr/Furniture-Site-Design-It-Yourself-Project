import Link from "next/link";
import type { Metadata } from "next";
import MetalRafTasarla from "@/components/tasarim/MetalRafTasarla";
import { metalRafDuzelt } from "@/lib/tasarim/metalRaf";

export const metadata: Metadata = {
  title: "Metal Raf Tasarla",
  description:
    "Çelik raf sistemini ölçüne göre tasarla. Bölme genişliği, derinlik, yükseklik, raf sayısı, sac ya da ahşap raf ve rengi seç, 3D önizle, fiyatını anında gör.",
  alternates: { canonical: "/kendin-tasarla/metal-raf" },
};

type Q = Record<string, string | undefined>;

export default async function Sayfa({ searchParams }: { searchParams: Promise<Q> }) {
  const q = await searchParams;
  const baslangic = metalRafDuzelt({
    genislik: q.g,
    derinlik: q.d,
    yukseklik: q.y,
    bolme: q.b,
    raf: q.r,
    rafMalzeme: q.rm,
    renk: q.renk,
    ahsapRenk: q.ar,
  });

  return (
    <main className="mx-auto max-w-330 px-4 py-6 md:py-8">
      <nav className="mb-4 text-xs text-neutral-500">
        <Link href="/" className="hover:underline">
          Ana sayfa
        </Link>
        <span className="mx-2">&gt;</span>
        <Link href="/kendin-tasarla" className="hover:underline">
          Kendin Tasarla
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="font-semibold text-neutral-800">Metal Raf</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900 md:text-3xl">Metal rafını kendin tasarla</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Garaj, depo, kiler ya da ofis için: ölçüyü, raf sayısını ve malzemeyi seç. Fiyat anında güncellenir.
        </p>
      </div>

      <MetalRafTasarla baslangic={baslangic} />
    </main>
  );
}
