import Link from "next/link";
import { redirect } from "next/navigation";
import { mevcutMusteri } from "@/lib/musteri";
import { cikisYap } from "../uye/actions";

export const dynamic = "force-dynamic";

export default async function HesapLayout({ children }: { children: React.ReactNode }) {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim");

  const menu = [
    { href: "/hesabim", ad: "Siparişlerim" },
    { href: "/hesabim/adresler", ad: "Adreslerim" },
    { href: "/hesabim/favoriler", ad: "Favorilerim" },
  ];

  return (
    <main className="mx-auto max-w-330 px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-light md:text-3xl">Hesabım</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {musteri.name} · {musteri.email}
          </p>
        </div>
        <form action={cikisYap}>
          <button className="border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">
            Çıkış yap
          </button>
        </form>
      </div>

      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <nav className="flex gap-4 overflow-x-auto whitespace-nowrap border-b border-neutral-200 pb-2 text-sm md:flex-col md:gap-1 md:border-b-0 md:pb-0">
          {menu.map((m) => (
            <Link key={m.href} href={m.href} className="py-1.5 hover:text-teal-700">
              {m.ad}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </main>
  );
}