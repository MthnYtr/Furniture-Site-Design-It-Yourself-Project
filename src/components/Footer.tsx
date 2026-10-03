import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SITE, SATIS_KANALLARI, SOSYAL } from "@/lib/site";

const baslik = "mb-4 text-xs font-bold uppercase tracking-wide text-neutral-800";
const baglanti = "hover:text-teal-700 hover:underline";

export default async function Footer() {
  const kategoriler = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  const kanallar = SATIS_KANALLARI.filter((k) => k.href);
  const sosyal = SOSYAL.filter((s) => s.href);
  const whatsappLink = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}` : "";

  return (
        <footer className="relative mt-16 overflow-hidden bg-[#efe6d8] text-sm text-neutral-700">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1600 500"
        preserveAspectRatio="none"
      >
        <path
          d="M-50 430 C 250 290, 420 500, 720 340 S 1180 110, 1650 270"
          fill="none"
          stroke="#bcd6dc"
          strokeWidth="70"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.7"
        />
        <path
          d="M-50 470 C 300 350, 480 520, 800 390 S 1250 190, 1650 330"
          fill="none"
          stroke="#f0e2c8"
          strokeWidth="24"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.9"
        />
      </svg>
      <div className="relative mx-auto grid max-w-330 grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4 lg:grid-cols-5">
        <div>
          <div className={baslik}>Bizi Tanı</div>
          <ul className="space-y-2">
            <li><Link href="/sayfa/showroomlar" className={baglanti}>Showroomlar</Link></li>
            <li><Link href="/sayfa/biz-kimiz" className={baglanti}>Biz Kimiz?</Link></li>
            <li><Link href="/sayfa/kariyer" className={baglanti}>Kariyer</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-1">
          <div className={baslik}>Kategoriler</div>
          <ul className="space-y-2">
            <li><Link href="/kampanyalar" className={baglanti}>Kampanyalar</Link></li>
            {kategoriler.map((k) => (
              <li key={k.id}>
                <Link href={`/kategori/${k.slug}`} className={baglanti}>{k.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className={baslik}>Satış Hattı</div>
          {kanallar.length === 0 ? (
            <p className="text-xs text-neutral-400">Yakında</p>
          ) : (
            <ul className="space-y-2">
              {kanallar.map((k) => (
                <li key={k.ad}>
                  <a href={k.href} target="_blank" rel="noopener noreferrer" className={baglanti}>
                    {k.ad}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-span-2 md:col-span-1 lg:col-span-2">
          <div className={baslik}>İletişim Hattı</div>
          <ul className="space-y-2">
            <li>
              <a href={`tel:${SITE.telefon.replace(/\s/g, "")}`} className={baglanti}>
                {SITE.telefon}
              </a>
              <span className="block text-xs text-neutral-400">{SITE.telefonSaatleri}</span>
            </li>
            {whatsappLink && (
              <li>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={baglanti}>
                  WhatsApp ile yaz
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${SITE.email}`} className={baglanti}>{SITE.email}</a>
            </li>
            <li>
              {SITE.adres}
              {SITE.haritaLink && (
                <a
                  href={SITE.haritaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-teal-700 hover:underline"
                >
                  Haritada aç
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>

            <div className="relative border-t border-[#b5cfd5] bg-[#cfe2e6]/80">
        <div className="mx-auto flex max-w-330 flex-col gap-4 px-4 py-4 text-xs md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {SITE.ad}. Tüm hakları saklıdır.</span>

          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/sayfa/mesafeli-satis" className={baglanti}>Mesafeli Satış Sözleşmesi</Link>
            <Link href="/sayfa/teslimat-ve-iade" className={baglanti}>Teslimat ve İade</Link>
            <Link href="/sayfa/kvkk" className={baglanti}>KVKK</Link>
            <Link href="/sayfa/cerez-politikasi" className={baglanti}>Çerez Politikası</Link>
          </nav>

          {(sosyal.length > 0 || whatsappLink) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-neutral-800">Bizi takip et:</span>
              {sosyal.map((s) => (
                <a
                  key={s.ad}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-neutral-400 bg-white/60 px-3 py-1 hover:border-teal-700 hover:text-teal-700"
                >
                  {s.ad}
                </a>
              ))}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-neutral-400 bg-white/60 px-3 py-1 hover:border-teal-700 hover:text-teal-700"
                >
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}