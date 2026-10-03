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

    // İptal edilirse stok geri eklenir
    if (yeni === "CANCELLED") {
      for (const it of s.items) {
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