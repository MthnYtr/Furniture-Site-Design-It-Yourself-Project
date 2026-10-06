import { notFound } from "next/navigation";
import { SAYFALAR } from "@/lib/site";
import type { Metadata } from "next";
import { kisalt } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = SAYFALAR[slug];
  if (!s) return {};
  return {
    title: s.baslik,
    description: kisalt(s.metin[0]),
    alternates: { canonical: `/sayfa/${slug}` },
  };
}

export default async function BilgiSayfasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sayfa = SAYFALAR[slug];
  if (!sayfa) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-light md:text-3xl">{sayfa.baslik}</h1>
      {sayfa.metin.map((p, i) => (
        <p key={i} className="mb-4 leading-7 text-neutral-700">
          {p}
        </p>
      ))}
    </main>
  );
}