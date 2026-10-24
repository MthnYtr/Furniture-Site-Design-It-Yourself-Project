import Link from "next/link";
import type { Metadata } from "next";
import DolapTasarla from "@/components/tasarim/DolapTasarla";
import { dolapDuzelt, siraOku } from "@/lib/tasarim/dolap";

export const metadata: Metadata = {
  title: "Banyo Dolabı Tasarla",
  description: "Lavabolu banyo dolabını, aynalı üst dolabı ve boy dolabı kendin tasarla. Neme dayanıklı malzeme, 3D önizleme, anında fiyat.",
  alternates: { canonical: "/kendin-tasarla/banyo" },
};

type Q = Record<string, string | undefined>;

export default async function Sayfa({ searchParams }: { searchParams: Promise<Q> }) {
  const q = await searchParams;

  // Adres çubuğundaki seçim (paylaşılan link) varsa onunla başla
  const baslangic = dolapDuzelt(
    {
      renk: q.renk,
      kapakRenk: q.kr,
      kulp: q.kulp,
      asma: q.asma === undefined ? undefined : q.asma === "1",
      altlar: siraOku(q.a),
      ustler: siraOku(q.u),
    },
    "banyo",
  );

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
        <span className="font-semibold text-neutral-800">Banyo Dolabı</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900 md:text-3xl">Banyo dolabını kendin tasarla</h1>
        <p className="mt-1 text-sm text-neutral-600">Alt dolapları (lavabolu, çekmeceli, boy) ve üst dolapları (aynalı, kapaklı) ayrı ayrı yerleştir. Fiyat anında güncellenir.</p>
      </div>

      <DolapTasarla baslangic={baslangic} />
    </main>
  );
}
