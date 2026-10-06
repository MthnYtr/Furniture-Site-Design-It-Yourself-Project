import { prisma } from "@/lib/prisma";

// Admin hiçbir şey yazmadıysa bu değerler görünür (şu anki anasayfa yazıları)
export const VARSAYILAN = {
  duyuruAktif: "1",
  duyuru: "Peşin Fiyatına 9 Taksit\n3 Ay Ödeme Erteleme\n36 Aya Varan Alışveriş Kredisi",
  heroRozet: "SONBAHAR FIRSATLARI DEVAM EDİYOR",
  heroBaslik: "Sepette **%20'ye Varan**\nİndirim Fırsatlarını Kaçırma",
  heroButon: "HEMEN KEŞFET",
  heroLink: "/kampanyalar",
};

export type AyarAnahtari = keyof typeof VARSAYILAN;

export async function ayarlariGetir() {
  const sonuc: Record<AyarAnahtari, string> = { ...VARSAYILAN };
  const satirlar = await prisma.siteSetting.findMany();
  for (const s of satirlar) {
    if (s.key in sonuc) sonuc[s.key as AyarAnahtari] = s.value;
  }
  return sonuc;
}