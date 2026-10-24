"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCart, saveCart } from "@/lib/cart";
import { mevcutMusteri } from "@/lib/musteri";
import { birimFiyat } from "@/lib/fiyat";
import { saveTasarimSepet, tasarimSatirlari } from "@/lib/tasarimSepet";
import { TASARIMLAR, tasarimSku, type TasarimTuru } from "@/lib/tasarim/kayit";
import type { Prisma } from "@/generated/prisma/client";

// Kendin Tasarla siparişleri için gizli (satışta görünmeyen) bir ürün kaydı.
// Sipariş kalemleri bir ürüne bağlı olmak zorunda; tasarım ayrıntısı kalemin config alanında saklanır.
async function tasarimUrunu(tx: Prisma.TransactionClient, tur: TasarimTuru) {
  const sku = tasarimSku(tur);
  const var_ = await tx.product.findUnique({ where: { sku } });
  if (var_) return var_.id;
  let kategori = await tx.category.findFirst({ orderBy: { sortOrder: "asc" } });
  if (!kategori) {
    kategori = await tx.category.create({ data: { name: "Kendin Tasarla", slug: "kendin-tasarla" } });
  }
  const yeni = await tx.product.create({
    data: {
      name: `Kendin Tasarla: ${TASARIMLAR[tur].ad}`,
      slug: `kendin-tasarla-${tur}`,
      sku,
      type: "CONFIGURABLE",
      basePrice: 0,
      stock: 0,
      isActive: false,
      categoryId: kategori.id,
      description: "Kendin Tasarla siparişleri için otomatik oluşturuldu. Satışta görünmez, silmeyin.",
    },
  });
  return yeni.id;
}

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
  const tasarimlar = await tasarimSatirlari();
  if (sepet.length === 0 && tasarimlar.length === 0) redirect("/sepet");

  const musteri = await mevcutMusteri();

  let kod: string;
  try {
    kod = await prisma.$transaction(async (tx) => {
      const urunler = await tx.product.findMany({
        where: { id: { in: sepet.map((x) => x.id) }, isActive: true },
        include: { variants: true },
      });

      const satirlar = sepet.flatMap((x) => {
        const u = urunler.find((p) => p.id === x.id);
        if (!u) return [];
        const varyant = x.v ? u.variants.find((y) => y.id === x.v) : undefined;
        if (u.variants.length > 0 && !varyant) return [];
        return [{ u, varyant, q: x.q }];
      });
      if (satirlar.length === 0 && tasarimlar.length === 0) throw new Error("BOS");

      let toplam = 0;
      const items: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = satirlar.map(({ u, varyant, q }) => {
        const fiyat = birimFiyat(u, varyant);
        toplam += fiyat * q;
        return {
          productId: u.id,
          productName: varyant ? `${u.name} (${varyant.name})` : u.name,
          quantity: q,
          unitPrice: fiyat,
          config: varyant
            ? { variantId: varyant.id, variantName: varyant.name, sku: varyant.sku }
            : undefined,
        };
      });

      // Kendin Tasarla kalemleri: fiyat tasarımdan sunucuda hesaplandı, stok düşülmez (özel üretim)
      for (const t of tasarimlar) {
        toplam += t.fiyat * t.q;
        items.push({
          productId: await tasarimUrunu(tx, t.tur),
          productName: `Kendin Tasarla: ${t.ad}`,
          quantity: t.q,
          unitPrice: t.fiyat,
          config: { tasarim: t.tur, sorgu: t.sorgu, ozet: t.ozet },
        });
      }

      const siparis = await tx.order.create({
        data: {
          fullName,
          email,
          phone,
          address: { il, ilce, adres },
          note,
          userId: musteri?.id ?? null,
          total: Math.round(toplam * 100) / 100,
          items: { create: items },
        },
      });

      // Stoku düş. Yeterli stok yoksa tüm işlem geri alınır.
      for (const { u, varyant, q } of satirlar) {
        if (varyant) {
          const sonuc = await tx.productVariant.updateMany({
            where: { id: varyant.id, stock: { gte: q } },
            data: { stock: { decrement: q } },
          });
          if (sonuc.count !== 1) throw new Error(`STOK:${u.name} (${varyant.name})`);
          await tx.product.update({
            where: { id: u.id },
            data: { stock: { decrement: q } },
          });
        } else {
          const sonuc = await tx.product.updateMany({
            where: { id: u.id, stock: { gte: q } },
            data: { stock: { decrement: q } },
          });
          if (sonuc.count !== 1) throw new Error(`STOK:${u.name}`);
        }
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

  if (musteri && formData.get("adresKaydet") === "on") {
    const kayitli = await prisma.address.findMany({ where: { userId: musteri.id } });
    const ayni = kayitli.some((a) => a.il === il && a.ilce === ilce && a.adres === adres);
    if (!ayni && kayitli.length < 10) {
      await prisma.address.create({
        data: {
          userId: musteri.id,
          title: `${ilce} / ${il}`,
          fullName,
          phone,
          il,
          ilce,
          adres,
          isDefault: kayitli.length === 0,
        },
      });
    }
  }

  await saveCart([]);
  await saveTasarimSepet([]);
  redirect(`/siparis-tamam/${kod}`);
}