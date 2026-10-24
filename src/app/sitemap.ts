import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SAYFALAR } from "@/lib/site";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [urunler, kategoriler] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, createdAt: true },
    }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);

  return [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/kampanyalar`, priority: 0.8 },
    { url: `${SITE_URL}/kendin-tasarla`, priority: 0.8 },
    { url: `${SITE_URL}/kendin-tasarla/kitaplik`, priority: 0.8 },
    { url: `${SITE_URL}/kendin-tasarla/masa`, priority: 0.8 },
    { url: `${SITE_URL}/kendin-tasarla/mutfak`, priority: 0.8 },
    { url: `${SITE_URL}/kendin-tasarla/banyo`, priority: 0.8 },
    { url: `${SITE_URL}/kendin-tasarla/metal-raf`, priority: 0.8 },
    { url: `${SITE_URL}/kendin-tasarla/ayakkabilik`, priority: 0.8 },
    ...kategoriler.map((k) => ({
      url: `${SITE_URL}/kategori/${k.slug}`,
      priority: 0.8,
    })),
    ...urunler.map((u) => ({
      url: `${SITE_URL}/urun/${u.slug}`,
      lastModified: u.createdAt,
      priority: 0.7,
    })),
    ...Object.keys(SAYFALAR).map((s) => ({
      url: `${SITE_URL}/sayfa/${s}`,
      priority: 0.3,
    })),
  ];
}