"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { DURUMLAR, type Durum } from "@/lib/siparis";

export async function durumGuncelle(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const id = Number(formData.get("id"));
  const yeni = String(formData.get("status")) as Durum;
  if (!id || !DURUMLAR.includes(yeni)) redirect("/admin/siparisler");

  await prisma.$transaction(async (tx) => {
    const s = await tx.order.findUnique({ where: { id }, include: { items: true } });
    // İptal edilmiş sipariş tekrar açılmaz, aynı duruma geçiş de yapılmaz
    if (!s || s.status === "CANCELLED" || s.status === yeni) return;

    // İptal edilirse stok geri eklenir (seçenekli ürünlerde seçeneğin stoğu da)
    if (yeni === "CANCELLED") {
      for (const it of s.items) {
        const cfg = it.config as { variantId?: number } | null;
        if (cfg?.variantId) {
          await tx.productVariant.updateMany({
            where: { id: cfg.variantId },
            data: { stock: { increment: it.quantity } },
          });
        }
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { increment: it.quantity } },
        });
      }
    }
    await tx.order.update({ where: { id }, data: { status: yeni } });
  });

  redirect(`/admin/siparisler/${id}`);
}

export async function kargoKaydet(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const id = Number(formData.get("id"));
  if (!id) redirect("/admin/siparisler");

  const cargoCompany = String(formData.get("company") ?? "").trim() || null;
  const trackingCode = String(formData.get("trackingCode") ?? "").trim() || null;
  const kargodaYap = formData.get("kargodaYap") === "on";

  const s = await prisma.order.findUnique({ where: { id } });
  if (!s) redirect("/admin/siparisler");

  // İstenirse sipariş durumu da "kargoya verildi"ye çekilir (iptal ve teslim edilmiş siparişe dokunulmaz)
  const kargoDurumu = DURUMLAR.find((d) => String(d) === "SHIPPED");
  const durumuDegistir =
    kargodaYap &&
    !!kargoDurumu &&
    String(s.status) !== "CANCELLED" &&
    String(s.status) !== "DELIVERED";

  await prisma.order.update({
    where: { id },
    data: {
      cargoCompany,
      trackingCode,
      shippedAt: s.shippedAt ?? (cargoCompany || trackingCode ? new Date() : null),
      ...(durumuDegistir && kargoDurumu ? { status: kargoDurumu } : {}),
    },
  });

  redirect(`/admin/siparisler/${id}`);
}