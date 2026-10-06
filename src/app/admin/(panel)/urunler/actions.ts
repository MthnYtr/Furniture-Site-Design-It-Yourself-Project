"use server";

import { redirect } from "next/navigation";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { metindenSatirlara } from "@/lib/ozellik";
import { varyantSenkronla } from "@/lib/varyant";

async function adminSart() {
  if (!(await isAdmin())) redirect("/admin/login");
}

function slugify(s: string) {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function dosyaSil(url: string) {
  if (!url.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "uploads", path.basename(url)));
  } catch {
    /* dosya zaten yoksa sorun değil */
  }
}

export async function kaydetUrun(id: number | null, formData: FormData) {
  await adminSart();
  const geri = id ? `/admin/urunler/${id}` : "/admin/urunler/yeni";

  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const categoryId = Number(formData.get("categoryId"));
  const basePrice = Number(String(formData.get("basePrice") ?? "").replace(",", "."));
  const satisRaw = String(formData.get("salePrice") ?? "").replace(",", ".").trim();
  const salePrice = satisRaw ? Number(satisRaw) : null;

  if (!name || !sku || !slug || !categoryId || !(basePrice > 0)) {
    redirect(`${geri}?hata=eksik`);
  }

  const data = {
    name,
    sku,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    type: formData.get("type") === "CONFIGURABLE" ? ("CONFIGURABLE" as const) : ("STANDARD" as const),
    basePrice,
    salePrice,
    stock: Number(formData.get("stock")) || 0,
    isActive: formData.get("isActive") === "on",
    attributes: {
      ozellikler: metindenSatirlara(String(formData.get("ozellikler") ?? "")),
      boyutlar: metindenSatirlara(String(formData.get("boyutlar") ?? "")),
    },
    categoryId,
  };

  let urunId: number;
  try {
    if (id) {
      await prisma.product.update({ where: { id }, data });
      urunId = id;
    } else {
      const yeni = await prisma.product.create({ data });
      urunId = yeni.id;
    }
  } catch (e) {
    const kod = (e as { code?: string }).code;
    redirect(`${geri}?hata=${kod === "P2002" ? "tekrar" : "genel"}`);
  }

  // Seçilen fotoğrafları sil
  const silinecekler = formData.getAll("silinecek").map(Number).filter(Boolean);
  if (silinecekler.length > 0) {
    const gorseller = await prisma.productImage.findMany({
      where: { id: { in: silinecekler }, productId: urunId },
    });
    await prisma.productImage.deleteMany({
      where: { id: { in: gorseller.map((g) => g.id) } },
    });
    for (const g of gorseller) await dosyaSil(g.url);
  }

    // Fotoğraf sırasını güncelle
  const mevcutGorseller = await prisma.productImage.findMany({ where: { productId: urunId } });
  for (const g of mevcutGorseller) {
    const ham = formData.get(`sira_${g.id}`);
    if (ham !== null && ham !== "") {
      const sira = Number(ham);
      if (Number.isFinite(sira) && sira !== g.sortOrder) {
        await prisma.productImage.update({ where: { id: g.id }, data: { sortOrder: sira } });
      }
    }
  }

  // Yeni fotoğrafları yükle
  const dosyalar = formData
    .getAll("gorseller")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (dosyalar.length > 0) {
    const klasor = path.join(process.cwd(), "uploads");
    await mkdir(klasor, { recursive: true });
    let sira = await prisma.productImage.count({ where: { productId: urunId } });

    for (const f of dosyalar) {
      const uzanti = path.extname(f.name).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(uzanti)) continue;
      const ad = `${randomUUID()}${uzanti}`;
      await writeFile(path.join(klasor, ad), Buffer.from(await f.arrayBuffer()));
      await prisma.productImage.create({
        data: { productId: urunId, url: `/uploads/${ad}`, alt: name, sortOrder: sira++ },
      });
    }
  }
  await varyantSenkronla(urunId);
  redirect("/admin/urunler");
}

export async function urunSil(formData: FormData) {
  await adminSart();
  const id = Number(formData.get("id"));
  if (!id) redirect("/admin/urunler");

  const gorseller = await prisma.productImage.findMany({ where: { productId: id } });

  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    redirect(`/admin/urunler/${id}?hata=siparisli`);
  }

  for (const g of gorseller) await dosyaSil(g.url);
  redirect("/admin/urunler");
}