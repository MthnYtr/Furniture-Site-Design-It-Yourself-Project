// Kendin Tasarla fiyat ayarları (kitaplık/dolap ve masa).
// ŞU ANKİ DEĞERLER PİYASA ORTALAMASINA GÖRE TAHMİNDİR (Ekim 2026).
// Kendi tedarikçi fiyatların gelince sadece bu dosyadaki sayıları değiştirmen yeterli.
// (İleride bunları admin panelinden değiştirilebilir yapacağız.)

export const FIYATLAR = {
  // 18 mm suntalam, m² fiyatı. 210×280 cm (5,88 m²) beyaz plaka ≈ 2.300 TL → ≈ 390 TL/m²
  levhaDuzM2: 390,
  // Ahşap desenli / renkli suntalam plaka ≈ 2.600 TL → ≈ 440 TL/m²
  levhaDesenliM2: 440,
  // 25 mm suntalam (masa tablası), m² fiyatı
  tablaDuzM2: 520,
  tablaDesenliM2: 580,
  // 3 mm HDF arkalık, m² fiyatı
  arkalikM2: 110,
  // PVC kenar bandı + uygulama, metre fiyatı
  bantM: 18,
  // Kesim artığı payı (%20)
  fireOrani: 0.2,

  // Cam kapak: 4 mm şeffaf cam (m²) + alüminyum çerçeve (metre)
  camM2: 950,
  camCerceveM: 160,

  // Donanım
  donanimModul: 120, // her modül: vida, minifix, ayak takımı
  birlestirme: 40, // yan yana iki modülü bağlayan vida takımı
  donanimRaf: 20, // raf pimleri (raf başı)
  mentese: 55, // frenli menteşe (adet)
  cekmeceRayi: 260, // bilyalı teleskopik ray (çift)

  // İşçilik: kesim, bantlama, delik
  iscilikSabit: 150, // sipariş başı
  iscilikModul: 200, // modül başı
  iscilikM2: 90, // levha m² başına
  iscilikKapak: 80, // kapak başı (menteşe yuvası, ayar)
  iscilikCekmece: 150, // çekmece başı (kutu montajı)

  // Ambalaj (koli, köşe koruma, streç)
  ambalajModul: 120,
  ambalajM2: 15,

  // Masa
  masaDonanim: 150, // vida, bağlantı, ayak pabuçları
  masaIscilik: 300, // masa başı sabit işçilik
  masaAmbalaj: 200,
  kabloDeligi: 60, // plastik kablo kapağı + delme
  metalAyakU: 1400, // U tipi metal ayak takımı (2 ayak + bağlantı)
  metalAyak4: 1150, // 4 kare ayak + çerçeve takımı

  // Mutfak ve banyo dolabı
  tezgahM: 1400, // 38 mm laminat tezgah, 60 cm derinlik, metre fiyatı
  tezgahKesim: 300, // evye / ocak kesimi (adet)
  tezgahKoseBirlesim: 450, // L tezgahta köşe birleşimi
  ayarliAyak: 25, // plastik ayarlı ayak (alt dolap başına 4 adet)
  askiAparati: 60, // duvara asma aparatı takımı (üst dolap ve asma banyo dolabı)
  aynaM2: 700, // 4 mm gümüş ayna
  // Seramik etajerli lavabo (dolap genişliğine göre)
  lavabo60: 1800,
  lavabo80: 2400,
  lavabo100: 3000,
  // Metal raf (çelik raf sistemi)
  metalDikmeM: 70, // 35×35 mm L profil dikme, metre fiyatı (galvaniz)
  sacRafM2: 450, // 0,7 mm sac raf, m² fiyatı
  metalKirisM: 55, // ahşap raf altındaki metal kiriş, metre fiyatı
  rafCivata: 20, // raf başı civata takımı
  plastikAyak: 8, // dikme başı plastik ayak
  boyaCarpani: 1.1, // galvaniz dışındaki renkler (elektrostatik boya)
  metalRafIscilik: 150,
  metalRafAmbalaj: 120,

  // Ayakkabılık
  klapaMekanizma: 110, // klapa menteşesi + stoper (klapa başı)
  metalAyakTakimi: 300, // 4 metal ayak
  minderM: 700, // oturma minderi, metre fiyatı

  // Banyoda neme dayanıklı levha (hidrofobik sunta / MDF-lam) normal levhaya göre bu kadar pahalı
  banyoLevhaCarpani: 1.25,

  // Maliyet × bu çarpan = satış fiyatı (genel gider, kâr ve KDV payı dahil)
  karCarpani: 1.5,
};

export type RenkKodu = "beyaz" | "antrasit" | "siyah" | "ceviz" | "mese";

export type RenkTanimi = { ad: string; renk: string; kenar: string; desenli: boolean; damar?: string; koyu?: boolean };

// kenar: parça kenarlarına çizilen ince çizgi. Koyu renklerde daha açık tutulur ki parçalar seçilsin.
export const RENKLER: Record<RenkKodu, RenkTanimi> = {
  beyaz: { ad: "Beyaz", renk: "#f4f2ee", kenar: "#d9d4cc", desenli: false },
  antrasit: { ad: "Antrasit", renk: "#55585e", kenar: "#8a8e95", desenli: false, koyu: true },
  siyah: { ad: "Siyah", renk: "#383838", kenar: "#808080", desenli: false, koyu: true },
  ceviz: { ad: "Ceviz", renk: "#7a5236", kenar: "#5a3b25", desenli: true, damar: "#5e3d26" },
  mese: { ad: "Sonoma Meşe", renk: "#c9a978", kenar: "#a8875a", desenli: true, damar: "#a8875a" },
};

export type KulpKodu = "siyah" | "krom" | "yok";

export const KULPLAR: Record<KulpKodu, { ad: string; aciklama: string; renk: string; metal: number; fiyat: number }> = {
  siyah: { ad: "Siyah", aciklama: "Mat siyah metal", renk: "#1f1f1f", metal: 0.5, fiyat: 70 },
  krom: { ad: "Krom", aciklama: "Parlak gümüş", renk: "#e6e8eb", metal: 0.3, fiyat: 85 },
  // Kulpsuz: kapak ve çekmecelere bas-aç mekanizması takılır
  yok: { ad: "Kulpsuz", aciklama: "Bas-aç sistem", renk: "#000000", metal: 0, fiyat: 90 },
};

export type MetalRenk = "siyah" | "beyaz" | "galvaniz" | "antrasit";
export const METAL_RENKLER: Record<MetalRenk, { ad: string; renk: string; metal?: number }> = {
  siyah: { ad: "Siyah", renk: "#232323" },
  beyaz: { ad: "Beyaz", renk: "#eeeeee" },
  galvaniz: { ad: "Galvaniz", renk: "#cdd1d5", metal: 0.25 },
  antrasit: { ad: "Antrasit", renk: "#4f5257" },
};

// Mutfak tezgahı renkleri (38 mm laminat)
export type TezgahKodu = "mermer" | "beton" | "granit" | "mese";
export const TEZGAH_RENKLERI: Record<TezgahKodu, RenkTanimi> = {
  mermer: { ad: "Beyaz mermer", renk: "#efede8", kenar: "#d2cec6", desenli: true, damar: "#c9c6c0" },
  beton: { ad: "Gri beton", renk: "#9d9b96", kenar: "#85837e", desenli: false },
  granit: { ad: "Siyah granit", renk: "#3a3a3a", kenar: "#6e6e6e", desenli: false, koyu: true },
  mese: { ad: "Meşe", renk: "#c9a978", kenar: "#a8875a", desenli: true, damar: "#a8875a" },
};
