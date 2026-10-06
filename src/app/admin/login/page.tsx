import { redirect } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { createSession, isAdmin } from "@/lib/auth";
import Uyari from "@/components/Uyari";

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
    <main className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="text-2xl font-light tracking-[0.25em] text-brand-900">RAFLIM</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            Yönetim paneli
          </div>
        </div>

        {hata && (
          <Uyari tip="hata" baslik="Giriş yapılamadı">
            E-posta veya şifre hatalı.
          </Uyari>
        )}

        <form action={girisYap} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-600">E-posta</label>
            <input name="email" type="email" autoComplete="username" required className="input" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Şifre</label>
            <input
              name="sifre"
              type="password"
              autoComplete="current-password"
              required
              className="input"
            />
          </div>
          <button className="btn btn-primary w-full py-3">GİRİŞ YAP</button>
        </form>
      </div>
    </main>
  );
}