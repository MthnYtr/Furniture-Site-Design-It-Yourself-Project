import { redirect } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { createSession, isAdmin } from "@/lib/auth";

function esit(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}

async function girisYap(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const sifre = String(formData.get("sifre") ?? "");
  const ok =
    esit(email, process.env.ADMIN_EMAIL ?? "") &&
    esit(sifre, process.env.ADMIN_PASSWORD ?? "");
  if (!ok) redirect("/admin/login?hata=1");
  await createSession();
  redirect("/admin");
}

export default async function LoginSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { hata } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <form action={girisYap} className="w-full max-w-sm space-y-4 bg-white p-8 shadow">
        <h1 className="text-center text-2xl font-light tracking-widest">YÖNETİM</h1>
        {hata && (
          <p className="bg-red-50 p-2 text-center text-sm text-red-600">
            E-posta veya şifre hatalı.
          </p>
        )}
        <input
          name="email"
          type="email"
          placeholder="E-posta"
          required
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="sifre"
          type="password"
          placeholder="Şifre"
          required
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
        <button className="w-full bg-brand-700 py-2 text-sm font-bold text-white hover:bg-brand-800">
          GİRİŞ YAP
        </button>
      </form>
    </main>
  );
}