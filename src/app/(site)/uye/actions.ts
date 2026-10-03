"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { musteriOturumAc, musteriOturumKapat } from "@/lib/musteri";

function guvenliYol(p: string) {
  return p.startsWith("/") && !p.startsWith("//") && !p.includes("\\") ? p : "/hesabim";
}

export async function kayitOl(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  const name = s("name");
  const email = s("email").toLowerCase();
  const phone = s("phone");
  const sifre = String(formData.get("sifre") ?? "");
  const sifre2 = String(formData.get("sifre2") ?? "");
  const next = guvenliYol(s("next"));
  const git = (hata: string) =>
    `/uye/kayit?hata=${hata}${next !== "/hesabim" ? `&next=${encodeURIComponent(next)}` : ""}`;

  if (!name || !email.includes("@")) redirect(git("eksik"));
  if (sifre.length < 8) redirect(git("kisa"));
  if (sifre !== sifre2) redirect(git("uyusmuyor"));

  const hash = await bcrypt.hash(sifre, 10);

  let userId: number;
  try {
    const user = await prisma.user.create({
      data: { name, email, phone: phone || null, passwordHash: hash },
    });
    userId = user.id;
  } catch (e) {
    const kod = (e as { code?: string }).code;
    redirect(git(kod === "P2002" ? "var" : "genel"));
  }

  await musteriOturumAc(userId);
  redirect(next);
}

export async function girisYap(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const sifre = String(formData.get("sifre") ?? "");
  const next = guvenliYol(String(formData.get("next") ?? ""));

  const user = await prisma.user.findUnique({ where: { email } });

  // Kullanıcı yoksa da aynı sürede işlem yap (e-posta var mı yok mu anlaşılmasın)
  const ok = user ? await bcrypt.compare(sifre, user.passwordHash) : (await bcrypt.hash(sifre, 10), false);

  if (!user || !ok) {
    redirect(
      `/uye/giris?hata=1${next !== "/hesabim" ? `&next=${encodeURIComponent(next)}` : ""}`
    );
  }

  await musteriOturumAc(user.id);
  redirect(next);
}

export async function cikisYap() {
  await musteriOturumKapat();
  redirect("/");
}