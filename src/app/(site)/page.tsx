import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ayarlariGetir } from "@/lib/ayarlar";
import { SITE } from "@/lib/site";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

// "**kalın**" ve satır sonlarını destekleyen küçük yardımcı
function Vurgulu({ metin }: { metin: string }) {
  return (
    <>
      {metin.split("\n").map((satir, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {satir.split("**").map((p, j) => (j % 2 ? <b key={j} className="font-bold">{p}</b> : p))}
        </span>
      ))}
    </>
  );
}

function Baslik({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 text-center md:mb-10">
      <h2 className="text-xl font-semibold tracking-widest md:text-2xl">{children}</h2>
      <div className="mx-auto mt-3 h-0.5 w-12 bg-brand-700" />
    </div>
  );
}

const ikon = "h-7 w-7 shrink-0 text-brand-700";

export default async function Home() {
  const [ayar, urunler, kategoriler] = await Promise.all([
    ayarlariGetir(),
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { variants: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const duyurular = ayar.duyuru
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const guvenler = [
    {
      baslik: "Hızlı Teslimat",
      alt: "Siparişin hızla hazırlanır",
      ikon: (
        <svg viewBox="0 0 24 24" className={ikon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="17" cy="18" r="1.6" />
        </svg>
      ),
    },
    {
      baslik: "Kurulum Hizmeti",
      alt: "İstersen kurulumu biz yapalım",
      ikon: (
        <svg viewBox="0 0 24 24" className={ikon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.7 2.7-2.3-.7-.7-2.3z" />
        </svg>
      ),
    },
    {
      baslik: "2 Yıl Garanti",
      alt: "Ürünlerimiz garantili",
      ikon: (
        <svg viewBox="0 0 24 24" className={ikon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
          <path d="M8.5 12l2.5 2.5L15.5 9.5" />
        </svg>
      ),
    },
    {
      baslik: "Destek Hattı",
      alt: SITE.telefon,
      ikon: (
        <svg viewBox="0 0 24 24" className={ikon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <main>
      {ayar.duyuruAktif === "1" && duyurular.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-900 md:text-base">
          {duyurular.map((d, i) => (
            <span key={i} className="flex items-center gap-4">
              {i > 0 && <span className="hidden text-brand-300 sm:inline">|</span>}
              <span className="whitespace-nowrap">{d}</span>
            </span>
          ))}
        </div>
      )}

      <section className="relative overflow-hidden bg-linear-to-r from-brand-50 via-brand-100 to-brand-200">
        <div className="pointer-events-none absolute -right-24 -top-24 hidden h-[130%] w-[38%] rounded-full bg-white/30 md:block" />
        <div className="relative mx-auto flex max-w-330 flex-col items-start gap-6 px-4 py-14 md:py-28">
          {ayar.heroRozet && (
            <span className="rounded-full border border-brand-700 bg-white/50 px-4 py-1.5 text-xs font-bold tracking-wider text-brand-800 md:text-sm">
              {ayar.heroRozet}
            </span>
          )}
          {ayar.heroBaslik && (
            <h1 className="text-4xl font-light leading-tight text-brand-900 md:text-6xl">
              <Vurgulu metin={ayar.heroBaslik} />
            </h1>
          )}
          {ayar.heroButon && (
            <Link href={ayar.heroLink} className="btn btn-primary px-8 py-3.5">
              {ayar.heroButon} &gt;
            </Link>
          )}
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-330 grid-cols-2 gap-x-4 gap-y-5 px-4 py-6 md:grid-cols-4 md:py-8">
          {guvenler.map((g) => (
            <div key={g.baslik} className="flex items-center gap-3">
              {g.ikon}
              <div>
                <div className="text-sm font-bold">{g.baslik}</div>
                <div className="text-xs text-neutral-500">{g.alt}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-330 px-4 py-10 md:py-16">
        <Baslik>ÖNE ÇIKANLAR</Baslik>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {kategoriler.slice(0, 4).map((k) =>
            k.image ? (
              <Link
                key={k.id}
                href={`/kategori/${k.slug}`}
                className="group relative block aspect-4/3 overflow-hidden rounded-lg bg-neutral-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={k.image}
                  alt={k.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-10 text-center text-sm font-bold text-white md:text-lg">
                  {k.name}
                </span>
              </Link>
            ) : (
              <Link
                key={k.id}
                href={`/kategori/${k.slug}`}
                className="flex aspect-4/3 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 px-2 text-center text-sm font-bold text-brand-900 transition-colors hover:border-brand-300 hover:bg-brand-100 md:text-lg"
              >
                {k.name}
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto max-w-330 px-4 pb-14 md:pb-24">
        <Baslik>ÇOK SATANLAR</Baslik>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {urunler.map((u) => (
            <ProductCard
              key={u.id}
              slug={u.slug}
              name={u.name}
              basePrice={Number(u.basePrice)}
              salePrice={u.salePrice ? Number(u.salePrice) : null}
              category={u.category.name}
              image={u.images[0]?.url ?? null}
              soldOut={u.stock <= 0}
              baslayan={u._count.variants > 0}
            />
          ))}
        </div>
      </section>
    </main>
  );
}