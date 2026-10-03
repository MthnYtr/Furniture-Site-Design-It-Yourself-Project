"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCart, saveCart } from "@/lib/cart";

export async function siparisVer(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? "").trim();

  const fullName = s("fullName");
  const email = s("email");
  const phone = s("phone");
  const il = s("il");
  const ilce = s("ilce");
  const adres = s("adres");
  const note = s("note") || null;

  if (
    !fullName ||
    !email.includes("@") ||
    phone.replace(/\D/g, "").length < 10 ||
    !il ||
    !ilce ||
    !adres
  ) {
    redirect("/odeme?hata=eksik");
  }

  const sepet = await getCart();
  if (sepet.length === 0) redirect("/sepet");

  let kod: string;
  try {
    kod = await prisma.$transaction(async (tx) => {
      const urunler = await tx.product.findMany({
        where: { id: { in: sepet.map((x) => x.id) }, isActive: true },
      });

      const satirlar = sepet.flatMap((x) => {
        const u = urunler.find((p) => p.id === x.id);
        return u ? [{ u, q: x.q }] : [];
      });
      if (satirlar.length === 0) throw new Error("BOS");

      let toplam = 0;
      const items = satirlar.map(({ u, q }) => {
        const fiyat = Number(u.salePrice ?? u.basePrice);
        toplam += fiyat * q;
        return { productId: u.id, productName: u.name, quantity: q, unitPrice: fiyat };
      });

      const siparis = await tx.order.create({
        data: {
          fullName,
          email,
          phone,
          address: { il, ilce, adres },
          note,
          total: Math.round(toplam * 100) / 100,
          items: { create: items },
        },
      });

      // Stoku düş. Yeterli stok yoksa tüm işlem geri alınır.
      for (const { u, q } of satirlar) {
        const sonuc = await tx.product.updateMany({
          where: { id: u.id, stock: { gte: q } },
          data: { stock: { decrement: q } },
        });
        if (sonuc.count !== 1) throw new Error("STOK:" + u.name);
      }

      return siparis.code;
    });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "";
    if (mesaj.startsWith("STOK:")) {
      redirect(`/odeme?hata=stok&urun=${encodeURIComponent(mesaj.slice(5))}`);
    }
    redirect("/odeme?hata=genel");
  }

  await saveCart([]);
  redirect(`/siparis-tamam/${kod}`);
}