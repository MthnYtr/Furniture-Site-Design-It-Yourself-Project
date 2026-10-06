"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mevcutMusteri } from "@/lib/musteri";

export async function profilGuncelle(formData: FormData) {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim/profil");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (name.length < 2) redirect("/hesabim/profil?hata=isim");
  if (phone && phone.replace(/\D/g, "").length < 10) redirect("/hesabim/profil?hata=telefon");

  await prisma.user.update({
    where: { id: musteri.id },
    data: { name, phone: phone || null },
  });

  redirect("/hesabim/profil?ok=bilgi");
}

export async function sifreDegistir(formData: FormData) {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim/profil");

  const eski = String(formData.get("eski") ?? "");
  const yeni = String(formData.get("yeni") ?? "");
  const yeni2 = String(formData.get("yeni2") ?? "");

  if (yeni.length < 8) redirect("/hesabim/profil?hata=kisa");
  if (yeni !== yeni2) redirect("/hesabim/profil?hata=uyusmuyor");

  const user = await prisma.user.findUnique({ where: { id: musteri.id } });
  if (!user) redirect("/uye/giris");

  const dogru = await bcrypt.compare(eski, user.passwordHash);
  if (!dogru) redirect("/hesabim/profil?hata=eski");

  if (eski === yeni) redirect("/hesabim/profil?hata=ayni");

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(yeni, 10) },
  });

  redirect("/hesabim/profil?ok=sifre");
}