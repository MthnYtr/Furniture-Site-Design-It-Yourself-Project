"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import type { AyarAnahtari } from "@/lib/ayarlar";

function guvenliLink(l: string) {
  if (l.startsWith("/") && !l.startsWith("//")) return l;
  if (l.startsWith("https://") || l.startsWith("http://")) return l;
  return "/kampanyalar";
}

export async function ayarKaydet(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const m = (k: string) => String(formData.get(k) ?? "").trim();

  const degerler: Record<AyarAnahtari, string> = {
    duyuruAktif: formData.get("duyuruAktif") === "on" ? "1" : "0",
    duyuru: m("duyuru"),
    heroRozet: m("heroRozet"),
    heroBaslik: m("heroBaslik"),
    heroButon: m("heroButon"),
    heroLink: guvenliLink(m("heroLink")),
  };

  await prisma.$transaction(
    Object.entries(degerler).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );

  redirect("/admin/ayarlar?ok=1");
}