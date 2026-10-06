"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/admin", ad: "Genel Bakış" },
  { href: "/admin/urunler", ad: "Ürünler" },
  { href: "/admin/kategoriler", ad: "Kategoriler" },
  { href: "/admin/siparisler", ad: "Siparişler" },
  { href: "/admin/ayarlar", ad: "Anasayfa Ayarları" },
];

export default function AdminMenu() {
  const yol = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] md:flex-col md:overflow-visible md:pb-0">
      {MENU.map((m) => {
        const aktif = m.href === "/admin" ? yol === "/admin" : yol.startsWith(m.href);
        return (
          <Link
            key={m.href}
            href={m.href}
            className={`whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
              aktif
                ? "bg-white/15 text-white"
                : "text-brand-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            {m.ad}
          </Link>
        );
      })}
    </nav>
  );
}