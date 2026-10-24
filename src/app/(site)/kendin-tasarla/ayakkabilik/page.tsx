import Link from "next/link";
import type { Metadata } from "next";
import AyakkabilikTasarla from "@/components/tasarim/AyakkabilikTasarla";
import { ayakkabilikDuzelt } from "@/lib/tasarim/ayakkabilik";

export const metadata: Metadata = {
  title: "Ayakkabılık Tasarla",
  description:
    "Ayakkabılığını ölçüne göre tasarla. Klapalı, kapaklı ya da açık raflı; rengi, kulpu ve oturma minderini seç, 3D önizle, fiyatını anında gör.",
  alternates: { canonical: "/kendin-tasarla/ayakkabilik" },
};

type Q = Record<string, string | undefined>;

export default async function Sayfa({ searchParams }: { searchParams: Promise<Q> }) {
  const q = await searchParams;
  const baslangic = ayakkabilikDuzelt({
    genislik: q.g,
    yukseklik: q.y,
    derinlik: q.d,
    tip: q.tip,
    renk: q.renk,
    kapakRenk: q.kr,
    kulp: q.kulp,
    ayak: q.ayak,
    minder: q.mi === undefined ? undefined : q.mi === "1",
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
        <span className="font-semibold text-neutral-800">Ayakkabılık</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900 md:text-3xl">Ayakkabılığını kendin tasarla</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Girişine tam oturan ayakkabılığı tasarla: klapalı, kapaklı ya da açık raflı. Fiyat anında güncellenir.
        </p>
      </div>

      <AyakkabilikTasarla baslangic={baslangic} />
    </main>
  );
}
