import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SITE, SATIS_KANALLARI, SOSYAL } from "@/lib/site";

const baslik = "mb-4 text-xs font-bold uppercase tracking-widest text-white";
const baglanti = "text-brand-200 transition-colors hover:text-white hover:underline";
const pil =
  "rounded-full border border-white/25 px-3.5 py-1.5 text-xs font-semibold text-brand-100 transition-colors hover:border-white hover:bg-white hover:text-brand-900";

export default async function Footer() {
  const kategoriler = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  const kanallar = SATIS_KANALLARI.filter((k) => k.href);
  const sosyal = SOSYAL.filter((s) => s.href);
  const whatsappLink = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}` : "";

  return (
    <footer className="mt-16 bg-brand-900 text-sm text-brand-200">
      <div className="mx-auto grid max-w-330 grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.4fr]">
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <Link href="/" className="text-3xl font-light tracking-[0.2em] text-white">
            {SITE.ad.toLocaleUpperCase("tr-TR")}
          </Link>
          <p className="mt-4 max-w-xs leading-6 text-brand-200">
            Raf, kitaplık, çalışma masası ve dolap. Hızlı teslimat, kurulum hizmeti ve 2 yıl garanti.
          </p>

          {(sosyal.length > 0 || whatsappLink) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {sosyal.map((s) => (
                <a key={s.ad} href={s.href} target="_blank" rel="noopener noreferrer" className={pil}>
                  {s.ad}
                </a>
              ))}
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={pil}>
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <div className={baslik}>Bizi Tanı</div>
          <ul className="space-y-2.5">
            <li><Link href="/sayfa/showroomlar" className={baglanti}>Showroomlar</Link></li>
            <li><Link href="/sayfa/biz-kimiz" className={baglanti}>Biz Kimiz?</Link></li>
            <li><Link href="/sayfa/kariyer" className={baglanti}>Kariyer</Link></li>
          </ul>
        </div>

        <div>
          <div className={baslik}>Kategoriler</div>
          <ul className="space-y-2.5">
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
            <p className="text-xs text-brand-300">Yakında</p>
          ) : (
            <ul className="space-y-2.5">
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

        <div className="col-span-2 md:col-span-1">
          <div className={baslik}>İletişim Hattı</div>
          <ul className="space-y-3">
            <li>
              <a
                href={`tel:${SITE.telefon.replace(/\s/g, "")}`}
                className="text-lg font-bold text-white hover:underline"
              >
                {SITE.telefon}
              </a>
              <span className="block text-xs text-brand-300">{SITE.telefonSaatleri}</span>
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
            <li className="leading-6">
              {SITE.adres}
              {SITE.haritaLink && (
                <a
                  href={SITE.haritaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-semibold text-amber-300 hover:underline"
                >
                  Haritada aç
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-330 flex-col gap-3 px-4 py-5 text-xs md:flex-row md:items-center md:justify-between">
          <span className="text-brand-300">
            © {new Date().getFullYear()} {SITE.ad}. Tüm hakları saklıdır.
          </span>

          <nav className="flex flex-wrap gap-x-5 gap-y-1.5">
            <Link href="/sayfa/mesafeli-satis" className={baglanti}>Mesafeli Satış Sözleşmesi</Link>
            <Link href="/sayfa/teslimat-ve-iade" className={baglanti}>Teslimat ve İade</Link>
            <Link href="/sayfa/kvkk" className={baglanti}>KVKK</Link>
            <Link href="/sayfa/cerez-politikasi" className={baglanti}>Çerez Politikası</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}