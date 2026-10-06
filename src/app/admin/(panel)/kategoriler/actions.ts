"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { gorselKaydet, gorselSil } from "@/lib/yukle";

async function adminSart() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function kategoriEkle(formData: FormData) {
  await adminSart();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  if (!name || !slug) redirect("/admin/kategoriler?hata=eksik");

  let image: string | null = null;
  try {
    image = await gorselKaydet(formData.get("gorsel"));
  } catch {
    redirect("/admin/kategoriler?hata=gorsel");
  }

  try {
    await prisma.category.create({ data: { name, slug, sortOrder, image } });
  } catch {
    await gorselSil(image);
    redirect("/admin/kategoriler?hata=tekrar");
  }
  redirect("/admin/kategoriler");
}

export async function kategoriGuncelle(formData: FormData) {
  await adminSart();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  if (!id || !name) redirect("/admin/kategoriler?hata=eksik");

  const mevcut = await prisma.category.findUnique({ where: { id } });
  if (!mevcut) redirect("/admin/kategoriler");

  let image = mevcut.image;
  let yeni: string | null = null;
  try {
    yeni = await gorselKaydet(formData.get("gorsel"));
  } catch {
    redirect("/admin/kategoriler?hata=gorsel");
  }
  if (yeni) {
    await gorselSil(mevcut.image);
    image = yeni;
  } else if (formData.get("gorselSil") === "on") {
    await gorselSil(mevcut.image);
    image = null;
  }

  await prisma.category.update({ where: { id }, data: { name, sortOrder, image } });
  redirect("/admin/kategoriler");
}

export async function kategoriSil(formData: FormData) {
  await adminSart();
  const id = Number(formData.get("id"));
  if (!id) redirect("/admin/kategoriler");

  const urunSayisi = await prisma.product.count({ where: { categoryId: id } });
  if (urunSayisi > 0) redirect("/admin/kategoriler?hata=urunvar");

  const mevcut = await prisma.category.findUnique({ where: { id } });

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    redirect("/admin/kategoriler?hata=genel");
  }
  await gorselSil(mevcut?.image);
  redirect("/admin/kategoriler");
}