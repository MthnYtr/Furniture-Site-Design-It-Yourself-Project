import Link from "next/link";
import { redirect } from "next/navigation";
import { mevcutMusteri } from "@/lib/musteri";
import { girisYap } from "../actions";

export const dynamic = "force-dynamic";

const alan = "w-full border border-neutral-300 px-3 py-2 text-sm";

export default async function GirisSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; next?: string }>;
}) {
  if (await mevcutMusteri()) redirect("/hesabim");
  const { hata, next = "" } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-light">Giriş yap</h1>

      <form action={girisYap} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        {hata && (
          <p className="bg-red-50 p-3 text-sm text-red-600">E-posta veya şifre hatalı.</p>
        )}
        <input name="email" type="email" placeholder="E-posta" required className={alan} />
        <input name="sifre" type="password" placeholder="Şifre" required className={alan} />
        <button className="w-full bg-teal-700 py-3 text-sm font-bold tracking-wide text-white hover:bg-teal-800">
          GİRİŞ YAP
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Hesabın yok mu?{" "}
        <Link
          href={next ? `/uye/kayit?next=${encodeURIComponent(next)}` : "/uye/kayit"}
          className="text-teal-700 hover:underline"
        >
          Üye ol
        </Link>
      </p>
    </main>
  );
}