import Link from "next/link";
import type { Metadata } from "next";
import { VARSAYILAN_SECIM, fiyatHesapla, secimDuzelt } from "@/lib/tasarim/kitaplik";
import { VARSAYILAN_MASA, masaDuzelt, masaFiyat } from "@/lib/tasarim/masa";
import { VARSAYILAN_DOLAP, dolapDuzelt, dolapFiyat } from "@/lib/tasarim/dolap";
import { VARSAYILAN_METAL_RAF, metalRafDuzelt, metalRafFiyat } from "@/lib/tasarim/metalRaf";
import { VARSAYILAN_AYAKKABILIK, ayakkabilikDuzelt, ayakkabilikFiyat } from "@/lib/tasarim/ayakkabilik";

export const metadata: Metadata = {
  title: "Kendin Tasarla",
  description:
    "Kitaplık, metal raf, ayakkabılık, mutfak ve banyo dolabı veya çalışma masanı: ölçüne göre kendin tasarla. 3D önizle, fiyatını anında gör, özel üretimle kapına gelsin.",
  alternates: { canonical: "/kendin-tasarla" },
};

const GRUPLAR = ["Raflar ve saklama", "Mutfak ve banyo", "Çalışma alanı"];
const SIRA = ["kitaplik", "metal-raf", "ayakkabilik", "mutfak", "banyo", "masa"].map((x) => `/kendin-tasarla/${x}`);

const tl = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";

function KitaplikCizim() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" fill="none" strokeLinejoin="round">
      <rect x="30" y="14" width="44" height="96" fill="#e2cfb8" stroke="#75472c" strokeWidth="2" />
      <rect x="74" y="14" width="56" height="96" fill="#e2cfb8" stroke="#75472c" strokeWidth="2" />
      <path d="M32 36h40M32 58h40M32 80h40" stroke="#75472c" strokeWidth="2" />
      <path d="M76 40h52" stroke="#75472c" strokeWidth="2" />
      <rect x="76" y="62" width="25" height="46" fill="#cfae8a" stroke="#75472c" strokeWidth="1.5" />
      <rect x="103" y="62" width="25" height="46" fill="#cfae8a" stroke="#75472c" strokeWidth="1.5" />
      <path d="M98 80v8M106 80v8" stroke="#432919" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function MasaCizim() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" fill="none" strokeLinejoin="round">
      <rect x="14" y="42" width="132" height="8" fill="#cfae8a" stroke="#75472c" strokeWidth="2" />
      <rect x="20" y="50" width="6" height="56" fill="#e2cfb8" stroke="#75472c" strokeWidth="1.5" />
      <rect x="98" y="50" width="42" height="56" fill="#e2cfb8" stroke="#75472c" strokeWidth="1.5" />
      <path d="M100 68h38M100 87h38" stroke="#75472c" strokeWidth="1.5" />
      <path d="M113 59h12M113 77h12M113 96h12" stroke="#432919" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="52" y="20" width="40" height="22" rx="2" fill="#f1e8dc" stroke="#75472c" strokeWidth="1.5" />
    </svg>
  );
}

function MutfakCizim() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" fill="none" strokeLinejoin="round">
      <rect x="14" y="14" width="44" height="30" fill="#e2cfb8" stroke="#75472c" strokeWidth="1.5" />
      <rect x="102" y="14" width="44" height="30" fill="#e2cfb8" stroke="#75472c" strokeWidth="1.5" />
      <path d="M36 14v30M124 14v30M32 38h8M120 38h8" stroke="#75472c" strokeWidth="1.5" />
      <rect x="10" y="66" width="140" height="6" fill="#cfae8a" stroke="#75472c" strokeWidth="1.5" />
      <rect x="14" y="72" width="132" height="38" fill="#e2cfb8" stroke="#75472c" strokeWidth="1.5" />
      <path d="M58 72v38M102 72v38M14 85h44M14 98h44M28 79h16M28 92h16M28 104h16" stroke="#75472c" strokeWidth="1.5" />
      <rect x="66" y="62" width="28" height="4" fill="#9a9a96" />
      <path d="M80 62v-8h6" stroke="#75472c" strokeWidth="1.5" />
    </svg>
  );
}

function BanyoCizim() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" fill="none" strokeLinejoin="round">
      <rect x="28" y="12" width="64" height="40" fill="#dfe8ec" stroke="#75472c" strokeWidth="1.5" />
      <path d="M60 12v40M38 22l8-6M70 22l8-6" stroke="#ffffff" strokeWidth="2" />
      <rect x="24" y="64" width="72" height="8" rx="2" fill="#ffffff" stroke="#75472c" strokeWidth="1.5" />
      <rect x="28" y="72" width="64" height="32" fill="#e2cfb8" stroke="#75472c" strokeWidth="1.5" />
      <path d="M60 72v32M54 78v6M66 78v6" stroke="#75472c" strokeWidth="1.5" />
      <path d="M60 64v-6h5" stroke="#75472c" strokeWidth="1.5" />
      <rect x="104" y="12" width="28" height="92" fill="#e2cfb8" stroke="#75472c" strokeWidth="1.5" />
      <path d="M104 60h28M126 52v-6M126 66v6" stroke="#75472c" strokeWidth="1.5" />
    </svg>
  );
}

function MetalRafCizim() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" fill="none" strokeLinejoin="round">
      <path d="M44 10v100M116 10v100M80 10v100" stroke="#6b6f75" strokeWidth="4" />
      {[22, 46, 70, 94].map((y) => (
        <rect key={y} x="44" y={y} width="72" height="5" fill="#b9bdc1" stroke="#6b6f75" strokeWidth="1.2" />
      ))}
      <rect x="50" y="34" width="22" height="12" fill="#cfae8a" stroke="#75472c" strokeWidth="1.2" />
      <rect x="86" y="58" width="24" height="12" fill="#e2cfb8" stroke="#75472c" strokeWidth="1.2" />
      <rect x="52" y="82" width="18" height="12" fill="#e2cfb8" stroke="#75472c" strokeWidth="1.2" />
    </svg>
  );
}

function AyakkabilikCizim() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" fill="none" strokeLinejoin="round">
      <rect x="36" y="20" width="88" height="80" fill="#e2cfb8" stroke="#75472c" strokeWidth="2" />
      <path d="M80 20v80M36 47h88M36 74h88" stroke="#75472c" strokeWidth="1.5" />
      <path d="M52 26h12M96 26h12M52 53h12M96 53h12M52 80h12M96 80h12" stroke="#432919" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="40" y="100" width="80" height="6" fill="#cfae8a" stroke="#75472c" strokeWidth="1.2" />
      <path d="M26 104c2-6 10-8 16-6l4 6H26z" fill="#75472c" />
    </svg>
  );
}

export default function KendinTasarla() {
  const urunler = [
    {
      grup: "Raflar ve saklama",
      href: "/kendin-tasarla/metal-raf",
      ad: "Metal Raf",
      aciklama: "Çelik raf sistemi: bölme genişliği, yükseklik, raf sayısı, sac ya da ahşap raf, galvaniz veya boyalı.",
      fiyat: metalRafFiyat(metalRafDuzelt(VARSAYILAN_METAL_RAF)).fiyat,
      cizim: <MetalRafCizim />,
    },
    {
      grup: "Raflar ve saklama",
      href: "/kendin-tasarla/ayakkabilik",
      ad: "Ayakkabılık",
      aciklama: "Klapalı, kapaklı ya da açık raflı. İstersen metal ayak ve oturma minderi.",
      fiyat: ayakkabilikFiyat(ayakkabilikDuzelt(VARSAYILAN_AYAKKABILIK)).fiyat,
      cizim: <AyakkabilikCizim />,
    },
    {
      grup: "Raflar ve saklama",
      href: "/kendin-tasarla/kitaplik",
      ad: "Kitaplık ve Dolap",
      aciklama: "Modülleri yan yana diz, raf, kapak, cam kapak ve çekmece seç. Her modülün genişliği ve yüksekliği ayrı.",
      fiyat: fiyatHesapla(secimDuzelt(VARSAYILAN_SECIM)).fiyat,
      cizim: <KitaplikCizim />,
    },
    {
      grup: "Çalışma alanı",
      href: "/kendin-tasarla/masa",
      ad: "Çalışma Masası",
      aciklama: "Genişlik ve derinliği seç, panel ya da metal ayak, istersen çekmece ünitesi ve kablo deliği ekle.",
      fiyat: masaFiyat(masaDuzelt(VARSAYILAN_MASA)).fiyat,
      cizim: <MasaCizim />,
    },
    {
      grup: "Mutfak ve banyo",
      href: "/kendin-tasarla/mutfak",
      ad: "Mutfak Dolabı",
      aciklama: "Düz ya da L mutfak. Alt ve üst dolapları ayrı diz, evye, ocak, beyaz eşya yeri, boy dolap ve tezgah rengi seç.",
      // Başlangıç fiyatı: tek modül (60 cm alt + üst kapaklı)
      fiyat: dolapFiyat(dolapDuzelt({ ...VARSAYILAN_DOLAP.mutfak, altlar: [{ genislik: 60, tur: "kapak" }], ustler: [{ genislik: 60, tur: "kapak" }] }, "mutfak")).fiyat,
      cizim: <MutfakCizim />,
    },
    {
      grup: "Mutfak ve banyo",
      href: "/kendin-tasarla/banyo",
      ad: "Banyo Dolabı",
      aciklama: "Lavabolu dolap, aynalı üst dolap ve boy dolap. Duvara asma ya da ayaklı, neme dayanıklı malzeme.",
      fiyat: dolapFiyat(dolapDuzelt({ ...VARSAYILAN_DOLAP.banyo, altlar: [{ genislik: 60, tur: "lavabo" }], ustler: [] }, "banyo")).fiyat,
      cizim: <BanyoCizim />,
    },
  ];

  return (
    <main className="mx-auto max-w-330 px-4 py-8 md:py-12">
      <nav className="mb-4 text-xs text-neutral-500">
        <Link href="/" className="hover:underline">
          Ana sayfa
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="font-semibold text-neutral-800">Kendin Tasarla</span>
      </nav>

      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-brand-900 md:text-4xl">Kendin tasarla</h1>
        <p className="mt-2 text-neutral-600">
          Evine tam oturan mobilyayı santim santim kendin tasarla. 3D olarak incele, fiyatını anında gör, özel üretimle
          kapına gelsin.
        </p>
      </div>

      <div className="space-y-10">
        {GRUPLAR.map((g) => (
          <section key={g}>
            <h2 className="mb-4 text-lg font-bold text-brand-900">{g}</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {urunler
                .filter((u) => u.grup === g)
                .sort((x, y) => SIRA.indexOf(x.href) - SIRA.indexOf(y.href))
                .map((u) => (
                  <Link
                    key={u.href}
                    href={u.href}
                    className="group card flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <div className="flex aspect-2/1 items-center justify-center bg-[#f6f1ea] p-5 transition-colors group-hover:bg-brand-50">
                      <div className="h-full max-h-48 w-full max-w-64">{u.cizim}</div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-bold text-brand-900">{u.ad}</h3>
                      <p className="mt-1 flex-1 text-sm text-neutral-600">{u.aciklama}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-neutral-600">
                          <span className="font-bold text-brand-900">{tl(u.fiyat)}</span>&apos;den başlayan
                        </span>
                        <span className="btn btn-primary px-4 py-2.5">Tasarlamaya başla</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
