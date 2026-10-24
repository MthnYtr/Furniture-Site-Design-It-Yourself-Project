import Link from "next/link";
import type { Metadata } from "next";
import MasaTasarla from "@/components/tasarim/MasaTasarla";
import { masaDuzelt } from "@/lib/tasarim/masa";

export const metadata: Metadata = {
  title: "Çalışma Masası Tasarla",
  description:
    "Çalışma masanı kendin tasarla. Ölçüyü, ayak tipini, çekmece ünitesini ve rengi seç, 3D önizle, fiyatını anında gör.",
  alternates: { canonical: "/kendin-tasarla/masa" },
};

type Q = Record<string, string | undefined>;

export default async function MasaTasarlaSayfasi({ searchParams }: { searchParams: Promise<Q> }) {
  const q = await searchParams;
  const evet = (v: string | undefined) => (v === undefined ? undefined : v === "1");

  const baslangic = masaDuzelt({
    genislik: q.g,
    derinlik: q.d,
    yukseklik: q.y,
    ayak: q.ayak,
    metalRenk: q.mr,
    renk: q.renk,
    cekmece: q.c,
    cekmeceSayi: q.cs,
    onPanel: evet(q.op),
    kabloDeligi: evet(q.kd),
    kulp: q.kulp,
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
        <span className="font-semibold text-neutral-800">Çalışma Masası</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900 md:text-3xl">Çalışma masanı kendin tasarla</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Ölçüyü, ayak tipini ve çekmeceyi seç, 3D olarak incele. Fiyat anında güncellenir.
        </p>
      </div>

      <MasaTasarla baslangic={baslangic} />
    </main>
  );
}
