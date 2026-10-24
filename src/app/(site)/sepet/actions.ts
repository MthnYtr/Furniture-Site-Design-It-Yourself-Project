"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ayniMi, getCart, saveCart } from "@/lib/cart";
import { tasarimCoz } from "@/lib/tasarim/kayit";
import {
  MAX_TASARIM,
  MAX_TASARIM_ADET,
  getTasarimSepet,
  saveTasarimSepet,
  yeniTasarimId,
} from "@/lib/tasarimSepet";

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
// Kendin Tasarla: tasarımı sepete ekler. Fiyat tarayıcıdan alınmaz, sunucuda hesaplanır.
export async function tasarimSepeteEkle(formData: FormData) {
  const tur = String(formData.get("tur") ?? "");
  const sorgu = String(formData.get("sorgu") ?? "");
  const t = tasarimCoz(tur, sorgu);
  if (!t) redirect("/kendin-tasarla");

  const sepet = await getTasarimSepet();
  const ayni = sepet.find((x) => x.t === t.tur && x.c === t.sorgu);
  if (ayni) {
    ayni.q = Math.min(MAX_TASARIM_ADET, ayni.q + 1);
  } else {
    if (sepet.length >= MAX_TASARIM) redirect("/sepet?hata=tasarimSiniri");
    sepet.push({ id: yeniTasarimId(), t: t.tur, c: t.sorgu, q: 1 });
  }
  await saveTasarimSepet(sepet);
  redirect("/sepet");
}

export async function tasarimAdetDegistir(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const fark = Number(formData.get("fark")) === -1 ? -1 : 1;
  const sepet = await getTasarimSepet();
  const yeni = sepet
    .map((x) => (x.id === id ? { ...x, q: Math.min(MAX_TASARIM_ADET, x.q + fark) } : x))
    .filter((x) => x.q > 0);
  await saveTasarimSepet(yeni);
  redirect("/sepet");
}

export async function tasarimCikar(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const sepet = await getTasarimSepet();
  await saveTasarimSepet(sepet.filter((x) => x.id !== id));
  redirect("/sepet");
}
