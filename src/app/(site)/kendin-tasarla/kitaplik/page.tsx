import Link from "next/link";
import type { Metadata } from "next";
import KitaplikTasarla from "@/components/tasarim/KitaplikTasarla";
import { modulleriOku, secimDuzelt } from "@/lib/tasarim/kitaplik";

export const metadata: Metadata = {
  title: "Kitaplık ve Dolap Tasarla",
  description:
    "Modüler kitaplığını veya dolabını kendin tasarla. Modülleri yan yana diz, raf, kapak ve çekmece seç, rengi ve kulpu belirle, 3D önizle, fiyatını anında gör.",
  alternates: { canonical: "/kendin-tasarla/kitaplik" },
};

type Q = Record<string, string | undefined>;

export default async function KitaplikTasarlaSayfasi({ searchParams }: { searchParams: Promise<Q> }) {
  const q = await searchParams;

  // Adres çubuğundaki seçim (paylaşılan link) varsa onunla başla
  const baslangic = secimDuzelt({
    derinlik: q.d,
    renk: q.renk,
    kapakRenk: q.kr,
    kulp: q.kulp,
    moduller: modulleriOku(q.m),
    arkalik: q.a === undefined ? undefined : q.a === "1",
    baza: q.b === undefined ? undefined : q.b === "1",
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
        <span className="font-semibold text-neutral-800">Kitaplık ve Dolap</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900 md:text-3xl">Kitaplığını kendin tasarla</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Modülleri yan yana diz, her birine raf, kapak ve çekmece seç, 3D olarak incele. Fiyat anında güncellenir.
        </p>
      </div>

      <KitaplikTasarla baslangic={baslangic} />
    </main>
  );
}
