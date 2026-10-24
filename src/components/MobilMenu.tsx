"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  kategoriler: { id: number; ad: string; slug: string }[];
  girisli: boolean;
};

export default function MobilMenu({ kategoriler, girisli }: Props) {
  const [acik, setAcik] = useState(false);

  // Menü açıkken arkadaki sayfa kaymasın
  useEffect(() => {
    document.body.style.overflow = acik ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [acik]);

  const kapat = () => setAcik(false);
  const satir =
    "block border-b border-neutral-100 px-5 py-3.5 text-sm font-semibold uppercase tracking-wide hover:bg-brand-50 hover:text-brand-700";

  return (
    <>
      <button
        type="button"
        aria-label="Menüyü aç"
        onClick={() => setAcik(true)}
        className="-ml-2 rounded-md p-2 hover:bg-neutral-100 md:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {acik && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={kapat} />
          <aside className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <span className="text-lg font-light tracking-[0.2em] text-brand-900">RAFLIM</span>
              <button
                type="button"
                aria-label="Menüyü kapat"
                onClick={kapat}
                className="rounded-md p-1.5 hover:bg-neutral-100"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto">
              <div className="px-5 pb-1 pt-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Kategoriler
              </div>
              {kategoriler.map((k) => (
                <Link key={k.id} href={`/kategori/${k.slug}`} onClick={kapat} className={satir}>
                  {k.ad}
                </Link>
              ))}

              <div className="px-5 pb-1 pt-6 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Hesabım
              </div>
              <Link href={girisli ? "/hesabim" : "/uye/giris"} onClick={kapat} className={satir}>
                {girisli ? "Hesabım" : "Giriş Yap / Üye Ol"}
              </Link>
              <Link
                href={girisli ? "/hesabim/favoriler" : "/uye/giris?next=/hesabim/favoriler"}
                onClick={kapat}
                className={satir}
              >
                Favorilerim
              </Link>
              <Link href="/kampanyalar" onClick={kapat} className={satir}>
                Kampanyalar
              </Link>
              <Link href="/kendin-tasarla" onClick={kapat} className={satir}>
                Kendin Tasarla
              </Link>
              <Link href="/sayfa/teslimat-ve-iade" onClick={kapat} className={satir}>
                Destek Merkezi
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}