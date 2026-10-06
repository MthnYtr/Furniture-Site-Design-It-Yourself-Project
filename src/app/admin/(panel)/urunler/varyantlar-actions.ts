"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { varyantSenkronla } from "@/lib/varyant";

export async function varyantKaydet(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const productId = Number(formData.get("productId"));
  const id = Number(formData.get("id")) || 0;
  const geri = `/admin/urunler/${productId}/secenekler`;

  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const price = Number(String(formData.get("price") ?? "").replace(",", "."));
  const stock = Math.floor(Number(formData.get("stock")) || 0);

  if (!productId || !name || !sku || !(price > 0) || stock < 0) {
    redirect(`${geri}?hata=eksik`);
  }

  try {
    if (id) {
      await prisma.productVariant.updateMany({
        where: { id, productId },
        data: { name, sku, price, stock },
      });
    } else {
      await prisma.productVariant.create({
        data: { productId, name, sku, price, stock },
      });
    }
  } catch (e) {
    const kod = (e as { code?: string }).code;
    redirect(`${geri}?hata=${kod === "P2002" ? "sku" : "genel"}`);
  }

  await varyantSenkronla(productId);
  redirect(geri);
}

export async function varyantSil(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const productId = Number(formData.get("productId"));
  const id = Number(formData.get("id"));
  if (!productId || !id) redirect("/admin/urunler");

  await prisma.productVariant.deleteMany({ where: { id, productId } });
  await varyantSenkronla(productId);
  redirect(`/admin/urunler/${productId}/secenekler`);
}