import { redirect } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { createSession, isAdmin } from "@/lib/auth";
import { basarisizKaydet, istemciIp, kilitDakika, sifirla } from "@/lib/hiz";
import Uyari from "@/components/Uyari";

const KURAL = { limit: 5, pencereMs: 15 * 60 * 1000, kilitMs: 15 * 60 * 1000 };

function esit(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}

async function girisYap(formData: FormData) {
  "use server";
  const anahtar = `admin:${await istemciIp()}`;

  const bekleme = kilitDakika(anahtar);
  if (bekleme > 0) redirect(`/admin/login?hata=kilit&dk=${bekleme}`);

  const email = String(formData.get("email") ?? "").trim();
  const sifre = String(formData.get("sifre") ?? "");

  // İkisi de her zaman kontrol edilir, hangisinin yanlış olduğu belli olmaz
  const emailOk = esit(email.toLowerCase(), (process.env.ADMIN_EMAIL ?? "").toLowerCase());
  const sifreOk = esit(sifre, process.env.ADMIN_PASSWORD ?? "");

  if (!(emailOk && sifreOk)) {
    await new Promise((r) => setTimeout(r, 1000));
    basarisizKaydet(anahtar, KURAL);
    const yeni = kilitDakika(anahtar);
    if (yeni > 0) redirect(`/admin/login?hata=kilit&dk=${yeni}`);
    redirect("/admin/login?hata=1");
  }

  sifirla(anahtar);
  await createSession();
  redirect("/admin");
}

export default async function LoginSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; dk?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { hata, dk } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="text-2xl font-light tracking-[0.25em] text-brand-900">RAFLIM</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            Yönetim paneli
          </div>
        </div>

        {hata === "kilit" && (
          <Uyari tip="uyari" baslik="Çok fazla hatalı deneme">
            Güvenlik için giriş geçici olarak kapatıldı. Yaklaşık {Number(dk) || 15} dakika sonra tekrar dene.
          </Uyari>
        )}
        {hata === "1" && (
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