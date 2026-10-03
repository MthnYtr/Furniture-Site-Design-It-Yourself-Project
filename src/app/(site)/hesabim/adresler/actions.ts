"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mevcutMusteri } from "@/lib/musteri";

const GERI = "/hesabim/adresler";

async function girisSart() {
  const m = await mevcutMusteri();
  if (!m) redirect(`/uye/giris?next=${GERI}`);
  return m;
}

export async function adresKaydet(formData: FormData) {
  const musteri = await girisSart();
  const s = (k: string) => String(formData.get(k) ?? "").trim();

  const id = Number(formData.get("id")) || 0;
  const title = s("title");
  const fullName = s("fullName");
  const phone = s("phone");
  const il = s("il");
  const ilce = s("ilce");
  const adres = s("adres");

  if (!title || !fullName || phone.replace(/\D/g, "").length < 10 || !il || !ilce || !adres) {
    redirect(`${GERI}?hata=eksik`);
  }

  const sayi = await prisma.address.count({ where: { userId: musteri.id } });
  if (!id && sayi >= 10) redirect(`${GERI}?hata=cok`);

  const varsayilan = formData.get("isDefault") === "on" || (!id && sayi === 0);

  await prisma.$transaction(async (tx) => {
    if (varsayilan) {
      await tx.address.updateMany({ where: { userId: musteri.id }, data: { isDefault: false } });
    }
    if (id) {
      await tx.address.updateMany({
        where: { id, userId: musteri.id },
        data: { title, fullName, phone, il, ilce, adres, isDefault: varsayilan ? true : undefined },
      });
    } else {
      await tx.address.create({
        data: { userId: musteri.id, title, fullName, phone, il, ilce, adres, isDefault: varsayilan },
      });
    }
  });

  redirect(GERI);
}

export async function adresSil(formData: FormData) {
  const musteri = await girisSart();
  const id = Number(formData.get("id"));
  if (!id) redirect(GERI);

  await prisma.address.deleteMany({ where: { id, userId: musteri.id } });

  // Varsayılan adres silindiyse en yenisini varsayılan yap
  const kalan = await prisma.address.findMany({
    where: { userId: musteri.id },
    orderBy: { createdAt: "desc" },
  });
  if (kalan.length > 0 && !kalan.some((a) => a.isDefault)) {
    await prisma.address.update({ where: { id: kalan[0].id }, data: { isDefault: true } });
  }

  redirect(GERI);
}

export async function varsayilanYap(formData: FormData) {
  const musteri = await girisSart();
  const id = Number(formData.get("id"));
  if (!id) redirect(GERI);

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: musteri.id }, data: { isDefault: false } }),
    prisma.address.updateMany({ where: { id, userId: musteri.id }, data: { isDefault: true } }),
  ]);

  redirect(GERI);
}