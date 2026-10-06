// Kargo firmaları ve takip sayfaları. Bağlantılar firmaların ana takip sayfasına gider.
// Bir firma adresini değiştirirse buradan güncelleyebilirsin.
export const KARGO_FIRMALARI = [
  { ad: "Yurtiçi Kargo", takip: "https://www.yurticikargo.com" },
  { ad: "Aras Kargo", takip: "https://www.araskargo.com.tr" },
  { ad: "MNG Kargo", takip: "https://www.mngkargo.com.tr" },
  { ad: "Sürat Kargo", takip: "https://www.suratkargo.com.tr" },
  { ad: "PTT Kargo", takip: "https://gonderitakip.ptt.gov.tr" },
  { ad: "HepsiJet", takip: "https://www.hepsijet.com" },
  { ad: "Kolay Gelsin", takip: "https://kolaygelsin.com" },
];

export function takipAdresi(firma: string | null | undefined) {
  if (!firma) return null;
  const f = KARGO_FIRMALARI.find((x) => x.ad.toLowerCase() === firma.trim().toLowerCase());
  return f?.takip ?? null;
}