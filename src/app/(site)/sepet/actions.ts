"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCart, saveCart } from "@/lib/cart";

export async function sepeteEkle(formData: FormData) {
  const id = Number(formData.get("productId"));
  const urun = await prisma.product.findUnique({
    where: { id },
    select: { id: true, isActive: true, stock: true, slug: true },
  });
  if (!urun || !urun.isActive) redirect("/");
  if (urun.stock <= 0) redirect(`/urun/${urun.slug}`);

  const sinir = Math.min(99, urun.stock);
  const sepet = await getCart();
  const var_mi = sepet.find((x) => x.id === id);

  if (var_mi) {
    if (var_mi.q >= sinir) redirect("/sepet?hata=sinir");
    var_mi.q += 1;
  } else {
    sepet.push({ id, q: 1 });
  }

  await saveCart(sepet);
  redirect("/sepet");
}

export async function adetDegistir(formData: FormData) {
  const id = Number(formData.get("id"));
  const fark = Number(formData.get("fark")) === -1 ? -1 : 1;

  const urun = await prisma.product.findUnique({
    where: { id },
    select: { stock: true },
  });
  const sinir = Math.min(99, urun?.stock ?? 0);

  const sepet = await getCart();
  const satir = sepet.find((x) => x.id === id);

  if (fark === 1 && satir && satir.q >= sinir) {
    redirect("/sepet?hata=sinir");
  }

  const yeni = sepet
    .map((x) => (x.id === id ? { ...x, q: x.q + fark } : x))
    .filter((x) => x.q > 0);

  await saveCart(yeni);
  redirect("/sepet");
}

export async function urunCikar(formData: FormData) {
  const id = Number(formData.get("id"));
  const sepet = await getCart();
  await saveCart(sepet.filter((x) => x.id !== id));
  redirect("/sepet");
}