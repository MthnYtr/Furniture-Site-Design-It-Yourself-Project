"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ayniMi, getCart, saveCart } from "@/lib/cart";

export async function sepeteEkle(formData: FormData) {
  const id = Number(formData.get("productId"));
  const secimId = Number(formData.get("variantId")) || 0;

  const urun = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!urun || !urun.isActive) redirect("/");
  const geri = `/urun/${urun.slug}`;

  let v: number | undefined;
  let stok = urun.stock;

  if (urun.variants.length > 0) {
    const secilen = urun.variants.find((x) => x.id === secimId);
    if (!secilen) redirect(geri);
    v = secilen.id;
    stok = secilen.stock;
  }

  if (stok <= 0) redirect(geri);
  const sinir = Math.min(99, stok);

  const sepet = await getCart();
  const var_mi = sepet.find((x) => ayniMi(x, id, v));

  if (var_mi) {
    if (var_mi.q >= sinir) redirect("/sepet?hata=sinir");
    var_mi.q += 1;
  } else {
    sepet.push(v ? { id, q: 1, v } : { id, q: 1 });
  }

  await saveCart(sepet);
  redirect("/sepet");
}

export async function adetDegistir(formData: FormData) {
  const id = Number(formData.get("id"));
  const v = Number(formData.get("v")) || undefined;
  const fark = Number(formData.get("fark")) === -1 ? -1 : 1;

  const urun = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  const stok = v
    ? (urun?.variants.find((x) => x.id === v)?.stock ?? 0)
    : (urun?.stock ?? 0);
  const sinir = Math.min(99, stok);

  const sepet = await getCart();
  const satir = sepet.find((x) => ayniMi(x, id, v));

  if (fark === 1 && satir && satir.q >= sinir) {
    redirect("/sepet?hata=sinir");
  }

  const yeni = sepet
    .map((x) => (ayniMi(x, id, v) ? { ...x, q: x.q + fark } : x))
    .filter((x) => x.q > 0);

  await saveCart(yeni);
  redirect("/sepet");
}

export async function urunCikar(formData: FormData) {
  const id = Number(formData.get("id"));
  const v = Number(formData.get("v")) || undefined;
  const sepet = await getCart();
  await saveCart(sepet.filter((x) => !ayniMi(x, id, v)));
  redirect("/sepet");
}