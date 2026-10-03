export const DURUMLAR = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type Durum = (typeof DURUMLAR)[number];

export const DURUM_ADI: Record<Durum, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal",
};

export const tl = (n: number) =>
  n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " TL";