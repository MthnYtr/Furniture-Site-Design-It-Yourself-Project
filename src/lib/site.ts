export const SITE = {
  ad: "Raflım",
  telefon: "0850 000 00 00",
  telefonSaatleri: "Hafta içi 09:00 - 18:00",
  // WhatsApp numarası: ülke koduyla, başında + ve boşluk olmadan (örn: 905551234567)
  whatsapp: "",
  email: "info@ornek.com",
  adres: "Örnek Mah. Örnek Sok. No:1, İlçe / İl",
  // Google Haritalar'da adresini açıp "Paylaş" ile aldığın link (boşsa gösterilmez)
  haritaLink: "",
};

// Ürünlerini sattığın diğer yerler. Linki boş bırakılan görünmez.
export const SATIS_KANALLARI: { ad: string; href: string }[] = [
  { ad: "Trendyol", href: "" },
  { ad: "Hepsiburada", href: "" },
  { ad: "Facebook", href: "" },
  { ad: "Amazon", href: "" },
  { ad: "n11", href: "" },
];

// Sosyal medya hesapların. Linki boş bırakılan görünmez.
export const SOSYAL: { ad: string; href: string }[] = [
  { ad: "Instagram", href: "" },
  { ad: "Facebook", href: "" },
  { ad: "YouTube", href: "" },
  { ad: "TikTok", href: "" },
];

// Footer'daki bilgi sayfalarının içeriği. Adres: /sayfa/<anahtar>
export const SAYFALAR: Record<string, { baslik: string; metin: string[] }> = {
  showroomlar: {
    baslik: "Showroomlar",
    metin: ["Showroom bilgileri yakında eklenecek."],
  },
  "biz-kimiz": {
    baslik: "Biz Kimiz?",
    metin: ["Hakkımızda yazısı yakında eklenecek."],
  },
  kariyer: {
    baslik: "Kariyer",
    metin: ["Açık pozisyon bulunmuyor."],
  },
  "teslimat-ve-iade": {
    baslik: "Teslimat ve İade",
    metin: ["Teslimat ve iade koşulları yakında eklenecek."],
  },
  "mesafeli-satis": {
    baslik: "Mesafeli Satış Sözleşmesi",
    metin: ["Sözleşme metni yakında eklenecek."],
  },
  kvkk: {
    baslik: "KVKK Aydınlatma Metni",
    metin: ["Aydınlatma metni yakında eklenecek."],
  },
  "cerez-politikasi": {
    baslik: "Çerez Politikası",
    metin: ["Çerez politikası yakında eklenecek."],
  },
};