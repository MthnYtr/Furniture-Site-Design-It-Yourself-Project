import Link from "next/link";
import type { Metadata } from "next";
import DolapTasarla from "@/components/tasarim/DolapTasarla";
import { dolapDuzelt, siraOku } from "@/lib/tasarim/dolap";

export const metadata: Metadata = {
  title: "Mutfak Dolabı Tasarla",
  description: "Alt ve üst dolapları duvar boyunca diz, evye, ocak ve beyaz eşya yerini seç, rengi ve tezgahı belirle, 3D önizle, fiyatını anında gör.",
  alternates: { canonical: "/kendin-tasarla/mutfak" },
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
      tezgah: q.tz,
      altlar: siraOku(q.a),
      ustler: siraOku(q.u),
      sekil: q.sk,
      kose: q.ko,
      koseTur: q.kt,
      koseUst: q.ku === undefined ? undefined : q.ku === "1",
      yanAltlar: siraOku(q.ya),
      yanUstler: siraOku(q.yu),
    },
    "mutfak",
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
        <span className="font-semibold text-neutral-800">Mutfak Dolabı</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900 md:text-3xl">Mutfağını kendin tasarla</h1>
        <p className="mt-1 text-sm text-neutral-600">Düz ya da L mutfak: alt ve üst dolapları ayrı ayrı diz, evye, ocak ve beyaz eşya yerlerini seç. Fiyat anında güncellenir.</p>
      </div>

      <DolapTasarla baslangic={baslangic} />
    </main>
  );
}
