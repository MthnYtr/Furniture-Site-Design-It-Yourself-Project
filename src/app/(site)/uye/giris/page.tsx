import Link from "next/link";
import { redirect } from "next/navigation";
import { mevcutMusteri } from "@/lib/musteri";
import Uyari from "@/components/Uyari";
import { girisYap } from "../actions";

export const dynamic = "force-dynamic";

const etiket = "mb-1.5 block text-xs font-semibold text-neutral-600";

export default async function GirisSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; next?: string }>;
}) {
  if (await mevcutMusteri()) redirect("/hesabim");
  const { hata, next = "" } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-10 md:py-16">
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="mb-1 text-2xl font-bold">Giriş yap</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Siparişlerini, adreslerini ve favorilerini görmek için giriş yap.
        </p>

        {hata && (
          <Uyari tip="hata" baslik="Giriş yapılamadı">
            E-posta veya şifre hatalı. Lütfen kontrol edip tekrar dene.
          </Uyari>
        )}

        <form action={girisYap} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className={etiket}>E-posta</label>
            <input
              name="email"
              type="email"
              autoComplete="username"
              placeholder="ornek@mail.com"
              required
              className="input"
            />
          </div>
          <div>
            <label className={etiket}>Şifre</label>
            <input
              name="sifre"
              type="password"
              autoComplete="current-password"
              placeholder="Şifren"
              required
              className="input"
            />
          </div>
          <button className="btn btn-primary w-full py-3.5">GİRİŞ YAP</button>
        </form>

        <div className="mt-6 border-t border-neutral-100 pt-6 text-center">
          <p className="mb-3 text-sm text-neutral-600">Hesabın yok mu?</p>
          <Link
            href={next ? `/uye/kayit?next=${encodeURIComponent(next)}` : "/uye/kayit"}
            className="btn btn-outline w-full"
          >
            ÜYE OL
          </Link>
        </div>
      </div>
    </main>
  );
}