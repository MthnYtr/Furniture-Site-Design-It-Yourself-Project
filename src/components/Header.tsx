import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Header() {
  const kategoriler = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <header className="bg-white shadow-sm">
      <div className="bg-[#3b4149] text-xs font-semibold uppercase tracking-wide text-white">
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

      <div className="mx-auto grid max-w-330 grid-cols-3 items-center px-4 py-6">
        <form className="max-w-70">
          <input
            type="text"
            placeholder="Evin için ne arıyorsun?"
            className="w-full border-b border-neutral-300 pb-2 text-sm outline-none placeholder:text-neutral-400"
          />
        </form>
        <Link href="/" className="text-center text-4xl font-light tracking-[0.15em]">
          RAFLIM
        </Link>
        <nav className="flex justify-end gap-6 text-xs font-semibold">
          <Link href="#">Giriş Yap</Link>
          <Link href="#">Favorilerim</Link>
          <Link href="#">Sepetim</Link>
        </nav>
      </div>

      <nav className="mx-auto flex max-w-330 flex-wrap gap-x-8 gap-y-2 px-4 pb-4 text-[11px] font-semibold uppercase tracking-wide">
        {kategoriler.map((k) => (
          <Link key={k.id} href={`/kategori/${k.slug}`} className="hover:text-teal-700">
            {k.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}