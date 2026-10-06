import { redirect } from "next/navigation";
import { mevcutMusteri } from "@/lib/musteri";
import Uyari from "@/components/Uyari";
import { profilGuncelle, sifreDegistir } from "./actions";

export const dynamic = "force-dynamic";

const HATALAR: Record<string, { baslik: string; aciklama: string }> = {
  isim: { baslik: "Ad soyad geçersiz", aciklama: "Ad soyad en az 2 karakter olmalı." },
  telefon: {
    baslik: "Telefon numarası geçersiz",
    aciklama: "Telefon numarası en az 10 haneli olmalı.",
  },
  kisa: { baslik: "Yeni şifre çok kısa", aciklama: "Yeni şifre en az 8 karakter olmalı." },
  uyusmuyor: {
    baslik: "Şifreler uyuşmuyor",
    aciklama: "Yeni şifre ile tekrarı aynı olmalı.",
  },
  eski: {
    baslik: "Mevcut şifre yanlış",
    aciklama: "Girdiğin mevcut şifre hesabınla eşleşmiyor. Şifren değiştirilmedi.",
  },
  ayni: { baslik: "Yeni şifre eskisiyle aynı", aciklama: "Lütfen farklı bir şifre seç." },
};

const etiket = "mb-1.5 block text-xs font-semibold text-neutral-600";
const kart = "rounded-lg border border-neutral-200 bg-white p-5 md:p-6";

export default async function Profilim({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; hata?: string }>;
}) {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim/profil");

  const sp = await searchParams;
  const hata = sp.hata ? HATALAR[sp.hata] : undefined;
  const bilgiHatasi = sp.hata === "isim" || sp.hata === "telefon";
  const sifreHatasi = !!hata && !bilgiHatasi;

  return (
    <div className="max-w-xl space-y-6">
      <section className={kart}>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">Bilgilerim</h2>

        {sp.ok === "bilgi" && <Uyari tip="basari" baslik="Bilgilerin güncellendi" />}
        {bilgiHatasi && hata && (
          <Uyari tip="hata" baslik={hata.baslik}>
            {hata.aciklama}
          </Uyari>
        )}

        <form action={profilGuncelle} className="space-y-4">
          <div>
            <label className={etiket}>Ad soyad</label>
            <input name="name" defaultValue={musteri.name ?? ""} required className="input" />
          </div>
          <div>
            <label className={etiket}>Telefon</label>
            <input
              name="phone"
              type="tel"
              defaultValue={musteri.phone ?? ""}
              placeholder="05XX XXX XX XX"
              className="input"
            />
          </div>
          <div>
            <label className={etiket}>E-posta</label>
            <input
              value={musteri.email}
              disabled
              className="input cursor-not-allowed bg-neutral-100 text-neutral-500"
            />
            <p className="mt-1 text-xs text-neutral-500">E-posta adresi değiştirilemez.</p>
          </div>
          <button className="btn btn-primary px-8">KAYDET</button>
        </form>
      </section>

      <section className={kart}>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">Şifre değiştir</h2>

        {sp.ok === "sifre" && (
          <Uyari tip="basari" baslik="Şifren değiştirildi">
            Bir sonraki girişte yeni şifreni kullan.
          </Uyari>
        )}
        {sifreHatasi && hata && (
          <Uyari tip="hata" baslik={hata.baslik}>
            {hata.aciklama}
          </Uyari>
        )}

        <form action={sifreDegistir} className="space-y-4">
          <div>
            <label className={etiket}>Mevcut şifre</label>
            <input
              name="eski"
              type="password"
              required
              autoComplete="current-password"
              autoFocus={sp.hata === "eski"}
              className={`input ${
                sp.hata === "eski" ? "border-red-600 bg-red-50 ring-1 ring-red-600" : ""
              }`}
            />
          </div>
          <div>
            <label className={etiket}>Yeni şifre</label>
            <input
              name="yeni"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="input"
            />
            <p className="mt-1 text-xs text-neutral-500">En az 8 karakter olmalı.</p>
          </div>
          <div>
            <label className={etiket}>Yeni şifre (tekrar)</label>
            <input
              name="yeni2"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="input"
            />
          </div>
          <button className="btn btn-primary px-8">ŞİFREYİ DEĞİŞTİR</button>
        </form>
      </section>
    </div>
  );
}