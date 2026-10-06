import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/sepet", "/odeme", "/hesabim", "/uye", "/siparis-tamam", "/ara"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}