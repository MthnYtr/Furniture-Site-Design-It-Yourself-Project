import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { mevcutMusteri } from "@/lib/musteri";

export default async function Header() {
  const kategoriler = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  const adet = (await getCart()).reduce((t, x) => t + x.q, 0);
  const musteri = await mevcutMusteri();

  return (
    <header className="bg-white shadow-sm">
      <div className="hidden bg-[#3b4149] text-xs font-semibold uppercase tracking-wide text-white md:block">
        <div className="mx-auto flex max-w-330 items-center justify-between px-4 py-2">
          <nav className="flex gap-6">
            <Link href="#">Showroomlar</Link>
            <Link href="#">Kurumsal Satış</Link>
          </nav>
          <nav className="flex gap-6">
            <Link href="#">Kampanyalar</Link>
            <Link href="#">Kendin Tasarla</Link>
            <Link href="#" className="text-amber-400">Destek Merkezi</Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto flex max-w-330 flex-wrap items-center justify-between gap-y-3 px-4 py-4 md:grid md:grid-cols-3 md:py-6">
        <Link
          href="/"
          className="order-1 text-2xl font-light tracking-[0.15em] md:order-2 md:text-center md:text-4xl"
        >
          RAFLIM
        </Link>

        <nav className="order-2 flex items-center gap-4 text-xs font-semibold md:order-3 md:justify-end md:gap-6">
          {musteri ? (
            <Link href="/hesabim">Hesabım</Link>
          ) : (
            <Link href="/uye/giris">Giriş Yap</Link>
          )}
          <Link
            href={musteri ? "/hesabim/favoriler" : "/uye/giris?next=/hesabim/favoriler"}
            className="hidden sm:inline"
          >
            Favorilerim
          </Link>
          <Link href="/sepet">
            Sepetim
            {adet > 0 && (
              <span className="ml-1 rounded-full bg-teal-700 px-1.5 py-0.5 text-[10px] text-white">
                {adet}
              </span>
            )}
          </Link>
        </nav>

        <form action="/ara" className="order-3 w-full md:order-1 md:max-w-70">
          <input
            type="search"
            name="q"
            placeholder="Evin için ne arıyorsun?"
            className="w-full border-b border-neutral-300 pb-2 text-sm outline-none placeholder:text-neutral-400"
          />
        </form>
      </div>

      <nav className="mx-auto flex max-w-330 gap-x-8 gap-y-2 overflow-x-auto whitespace-nowrap px-4 pb-4 text-[11px] font-semibold uppercase tracking-wide [scrollbar-width:none] md:flex-wrap">
        {kategoriler.map((k) => (
          <Link key={k.id} href={`/kategori/${k.slug}`} className="hover:text-teal-700">
            {k.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}