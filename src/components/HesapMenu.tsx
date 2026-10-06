"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/hesabim", ad: "Siparişlerim" },
  { href: "/hesabim/adresler", ad: "Adreslerim" },
  { href: "/hesabim/favoriler", ad: "Favorilerim" },
  { href: "/hesabim/profil", ad: "Profilim" },
];

export default function HesapMenu() {
  const yol = usePathname();

  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-col md:gap-1 md:self-start md:rounded-lg md:border md:border-neutral-200 md:bg-white md:p-2 md:pb-2">
      {MENU.map((m) => {
        const aktif = m.href === "/hesabim" ? yol === m.href : yol.startsWith(m.href);
        return (
          <Link
            key={m.href}
            href={m.href}
            className={`whitespace-nowrap rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors md:border-0 ${
              aktif
                ? "border-brand-700 bg-brand-700 text-white md:bg-brand-50 md:text-brand-800"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-brand-300 hover:text-brand-700 md:bg-transparent md:hover:bg-neutral-100"
            }`}
          >
            {m.ad}
          </Link>
        );
      })}
    </nav>
  );
}