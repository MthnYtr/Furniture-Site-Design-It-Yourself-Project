"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mevcutMusteri } from "@/lib/musteri";

function guvenliYol(p: string) {
  return p.startsWith("/") && !p.startsWith("//") && !p.includes("\\")
    ? p
    : "/hesabim/favoriler";
}

export async function favoriDegistir(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const donus = guvenliYol(String(formData.get("donus") ?? ""));

  const musteri = await mevcutMusteri();
  if (!musteri) redirect(`/uye/giris?next=${encodeURIComponent(donus)}`);
  if (!productId) redirect(donus);

  const var_mi = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: musteri.id, productId } },
  });

  if (var_mi) {
    await prisma.favorite.delete({ where: { id: var_mi.id } });
  } else {
    const urun = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (urun) {
      try {
        await prisma.favorite.create({ data: { userId: musteri.id, productId } });
      } catch {
        /* aynı anda iki kez eklenirse sorun değil */
      }
    }
  }

  redirect(donus);
}