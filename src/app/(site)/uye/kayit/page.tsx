import Link from "next/link";
import { redirect } from "next/navigation";
import { mevcutMusteri } from "@/lib/musteri";
import Uyari from "@/components/Uyari";
import { kayitOl } from "../actions";

export const dynamic = "force-dynamic";

const etiket = "mb-1.5 block text-xs font-semibold text-neutral-600";

const HATALAR: Record<string, { baslik: string; aciklama: string }> = {
  eksik: { baslik: "Eksik bilgi", aciklama: "Ad soyad ve geçerli bir e-posta gir." },
  kisa: { baslik: "Şifre çok kısa", aciklama: "Şifre en az 8 karakter olmalı." },
  uyusmuyor: { baslik: "Şifreler uyuşmuyor", aciklama: "İki şifre alanı birbiriyle aynı olmalı." },
  var: {
    baslik: "Bu e-posta zaten kayıtlı",
    aciklama: "Bu e-posta ile bir hesap var. Giriş yapmayı dene.",
  },
  genel: { baslik: "Kayıt tamamlanamadı", aciklama: "Bir sorun oluştu, lütfen tekrar dene." },
};

export default async function KayitSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; next?: string }>;
}) {
  if (await mevcutMusteri()) redirect("/hesabim");
  const { hata, next = "" } = await searchParams;
  const h = hata ? (HATALAR[hata] ?? HATALAR.genel) : null;

  return (
    <main className="mx-auto max-w-md px-4 py-10 md:py-16">
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="mb-1 text-2xl font-bold">Üye ol</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Üye olarak siparişlerini takip edebilir, adreslerini ve favorilerini kaydedebilirsin.
        </p>

        {h && (
          <Uyari tip="hata" baslik={h.baslik}>
            {h.aciklama}
          </Uyari>
        )}

        <form action={kayitOl} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className={etiket}>Ad soyad *</label>
            <input name="name" autoComplete="name" required className="input" />
          </div>
          <div>
            <label className={etiket}>E-posta *</label>
            <input name="email" type="email" autoComplete="email" required className="input" />
            <p className="mt-1 text-xs text-neutral-500">
              E-posta adreslerinde Türkçe karakter (ş, ı, ğ, ü, ö, ç) kullanılamaz.
            </p>
          </div>
          <div>
            <label className={etiket}>Telefon (isteğe bağlı)</label>
            <input name="phone" type="tel" autoComplete="tel" placeholder="05XX XXX XX XX" className="input" />
          </div>
          <div>
            <label className={etiket}>Şifre *</label>
            <input
              name="sifre"
              type="password"
              autoComplete="new-password"
              required
              className="input"
            />
            <p className="mt-1 text-xs text-neutral-500">En az 8 karakter olmalı.</p>
          </div>
          <div>
            <label className={etiket}>Şifre tekrar *</label>
            <input name="sifre2" type="password" autoComplete="new-password" required className="input" />
          </div>
          <button className="btn btn-primary w-full py-3.5">ÜYE OL</button>
        </form>

        <div className="mt-6 border-t border-neutral-100 pt-6 text-center">
          <p className="mb-3 text-sm text-neutral-600">Zaten hesabın var mı?</p>
          <Link
            href={next ? `/uye/giris?next=${encodeURIComponent(next)}` : "/uye/giris"}
            className="btn btn-outline w-full"
          >
            GİRİŞ YAP
          </Link>
        </div>
      </div>
    </main>
  );
}