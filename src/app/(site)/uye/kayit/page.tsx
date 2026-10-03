import Link from "next/link";
import { redirect } from "next/navigation";
import { mevcutMusteri } from "@/lib/musteri";
import { kayitOl } from "../actions";

export const dynamic = "force-dynamic";

const alan = "w-full border border-neutral-300 px-3 py-2 text-sm";

const HATALAR: Record<string, string> = {
  eksik: "Ad soyad ve geçerli bir e-posta gir.",
  kisa: "Şifre en az 8 karakter olmalı.",
  uyusmuyor: "Şifreler birbiriyle aynı değil.",
  var: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.",
  genel: "Kayıt sırasında bir sorun oluştu, tekrar dene.",
};

export default async function KayitSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; next?: string }>;
}) {
  if (await mevcutMusteri()) redirect("/hesabim");
  const { hata, next = "" } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-light">Üye ol</h1>

      <form action={kayitOl} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        {hata && (
          <p className="bg-red-50 p-3 text-sm text-red-600">{HATALAR[hata] ?? HATALAR.genel}</p>
        )}
        <input name="name" placeholder="Ad soyad" required className={alan} />
        <input name="email" type="email" placeholder="E-posta" required className={alan} />
        <input name="phone" type="tel" placeholder="Telefon (isteğe bağlı)" className={alan} />
        <input
          name="sifre"
          type="password"
          placeholder="Şifre (en az 8 karakter)"
          required
          className={alan}
        />
        <input name="sifre2" type="password" placeholder="Şifre tekrar" required className={alan} />
        <button className="w-full bg-teal-700 py-3 text-sm font-bold tracking-wide text-white hover:bg-teal-800">
          ÜYE OL
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Zaten hesabın var mı?{" "}
        <Link
          href={next ? `/uye/giris?next=${encodeURIComponent(next)}` : "/uye/giris"}
          className="text-teal-700 hover:underline"
        >
          Giriş yap
        </Link>
      </p>
    </main>
  );
}