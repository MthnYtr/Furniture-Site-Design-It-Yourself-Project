import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { mevcutMusteri } from "@/lib/musteri";
import MobilMenu from "@/components/MobilMenu";

const svg = "h-6 w-6";

function KullaniciIkon() {
  return (
    <svg viewBox="0 0 24 24" className={svg} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

function KalpIkon() {
  return (
    <svg viewBox="0 0 24 24" className={svg} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 6.8 4.5 4.5 0 0 1 20 9.5c0 6.1-8 11-8 11z" />
    </svg>
  );
}

function SepetIkon() {
  return (
    <svg viewBox="0 0 24 24" className={svg} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2.5l2.2 11h10.6L20.5 8H6.4" />
      <circle cx="9" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </svg>
  );
}

function AramaIkon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

function AramaFormu({ className = "" }: { className?: string }) {
  return (
    <form action="/ara" role="search" className={`relative ${className}`}>
      <input
        type="search"
        name="q"
        placeholder="Evin için ne arıyorsun?"
        className="h-11 w-full rounded-md border border-neutral-200 bg-neutral-50 pl-4 pr-11 text-sm transition placeholder:text-neutral-400 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
      />
      <button
        type="submit"
        aria-label="Ara"
        className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-neutral-500 hover:text-brand-700"
      >
        <AramaIkon />
      </button>
    </form>
  );
}

const ikonLink =
  "relative flex items-center gap-2 rounded-md p-2 text-[13px] font-semibold text-neutral-800 transition-colors hover:text-brand-700";

export default async function Header() {
  const kategoriler = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  const adet = (await getCart()).reduce((t, x) => t + x.q, 0);
  const musteri = await mevcutMusteri();

  return (
    <>
      <div className="hidden bg-brand-900 text-[11px] font-semibold uppercase tracking-wider text-white md:block">
        <div className="mx-auto flex max-w-330 items-center justify-between px-4 py-2.5">
          <nav className="flex gap-6">
            <Link href="/sayfa/showroomlar" className="transition-colors hover:text-amber-300">
              Showroomlar
            </Link>
            <Link href="#" className="transition-colors hover:text-amber-300">
              Kurumsal Satış
            </Link>
          </nav>
          <nav className="flex gap-6">
            <Link href="/kampanyalar" className="transition-colors hover:text-amber-300">
              Kampanyalar
            </Link>
            <Link href="#" className="transition-colors hover:text-amber-300">
              Kendin Tasarla
            </Link>
            <Link href="/sayfa/teslimat-ve-iade" className="text-amber-400 transition-colors hover:text-amber-300">
              Destek Merkezi
            </Link>
          </nav>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-330 px-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3 md:py-5">
            <div className="flex items-center">
              <MobilMenu
                kategoriler={kategoriler.map((k) => ({ id: k.id, ad: k.name, slug: k.slug }))}
                girisli={!!musteri}
              />
              <AramaFormu className="hidden w-full max-w-xs md:block" />
            </div>

            <Link
              href="/"
              className="text-center text-2xl font-light tracking-[0.2em] text-brand-900 md:text-4xl"
            >
              RAFLIM
            </Link>

            <nav className="flex items-center justify-end gap-1 md:gap-3">
              <Link
                href={musteri ? "/hesabim" : "/uye/giris"}
                aria-label={musteri ? "Hesabım" : "Giriş yap"}
                className={ikonLink}
              >
                <KullaniciIkon />
                <span className="hidden lg:inline">{musteri ? "Hesabım" : "Giriş Yap"}</span>
              </Link>
              <Link
                href={musteri ? "/hesabim/favoriler" : "/uye/giris?next=/hesabim/favoriler"}
                aria-label="Favorilerim"
                className={`${ikonLink} hidden sm:flex`}
              >
                <KalpIkon />
                <span className="hidden lg:inline">Favorilerim</span>
              </Link>
              <Link href="/sepet" aria-label="Sepetim" className={ikonLink}>
                <span className="relative">
                  <SepetIkon />
                  {adet > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[11px] font-bold leading-none text-white">
                      {adet}
                    </span>
                  )}
                </span>
                <span className="hidden lg:inline">Sepetim</span>
              </Link>
            </nav>
          </div>

          <AramaFormu className="pb-3 md:hidden" />
        </div>

        <nav className="hidden border-t border-neutral-100 md:block">
          <div className="mx-auto flex max-w-330 flex-wrap gap-x-8 px-4 text-[13px] font-semibold uppercase tracking-wide">
            {kategoriler.map((k) => (
              <Link
                key={k.id}
                href={`/kategori/${k.slug}`}
                className="relative py-3.5 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand-700 after:transition-transform after:duration-200 hover:text-brand-700 hover:after:scale-x-100"
              >
                {k.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>
    </>
  );
}