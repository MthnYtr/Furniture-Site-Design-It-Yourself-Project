import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mevcutMusteri } from "@/lib/musteri";
import Uyari from "@/components/Uyari";
import { adresKaydet, adresSil, varsayilanYap } from "./actions";

export const dynamic = "force-dynamic";

const etiket = "mb-1.5 block text-xs font-semibold text-neutral-600";

const HATALAR: Record<string, { baslik: string; aciklama: string }> = {
  eksik: {
    baslik: "Eksik veya hatalı bilgi",
    aciklama: "Lütfen tüm alanları doğru doldur (telefon en az 10 haneli olmalı).",
  },
  cok: {
    baslik: "Adres sınırına ulaştın",
    aciklama: "En fazla 10 adres kaydedebilirsin. Önce birini sil.",
  },
};

export default async function Adreslerim({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; duzenle?: string }>;
}) {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim/adresler");

  const { hata, duzenle } = await searchParams;
  const h = hata ? (HATALAR[hata] ?? { baslik: "Bir sorun oluştu", aciklama: "Lütfen tekrar dene." }) : null;

  const adresler = await prisma.address.findMany({
    where: { userId: musteri.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  const duzenlenen = duzenle ? adresler.find((a) => a.id === Number(duzenle)) : undefined;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Adreslerim ({adresler.length})</h2>

      {h && (
        <Uyari tip="hata" baslik={h.baslik}>
          {h.aciklama}
        </Uyari>
      )}

      {adresler.length === 0 ? (
        <div className="mb-8 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
          Henüz kayıtlı adresin yok. Aşağıdan ekleyebilirsin.
        </div>
      ) : (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {adresler.map((a) => (
            <div
              key={a.id}
              className={`rounded-lg border bg-white p-4 text-sm ${
                a.isDefault ? "border-brand-700 ring-1 ring-brand-700" : "border-neutral-200"
              } ${duzenlenen?.id === a.id ? "bg-brand-50" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-bold">{a.title}</span>
                {a.isDefault && (
                  <span className="rounded-full bg-brand-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
                    Varsayılan
                  </span>
                )}
              </div>
              <div className="font-medium">
                {a.fullName} <span className="font-normal text-neutral-500">· {a.phone}</span>
              </div>
              <div className="mt-1 text-neutral-600">
                {a.adres}, {a.ilce} / {a.il}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-100 pt-3 text-xs font-semibold">
                <Link href={`/hesabim/adresler?duzenle=${a.id}`} className="text-brand-700 hover:underline">
                  Düzenle
                </Link>
                {!a.isDefault && (
                  <form action={varsayilanYap}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="text-brand-700 hover:underline">Varsayılan yap</button>
                  </form>
                )}
                <form action={adresSil} className="ml-auto">
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-red-600 hover:underline">Sil</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        key={duzenlenen?.id ?? "yeni"}
        action={adresKaydet}
        className="max-w-xl space-y-4 rounded-lg border border-neutral-200 bg-white p-5 md:p-6"
      >
        <h3 className="text-sm font-bold uppercase tracking-wider">
          {duzenlenen ? "Adresi düzenle" : "Yeni adres ekle"}
        </h3>
        <input type="hidden" name="id" value={duzenlenen?.id ?? ""} />

        <div>
          <label className={etiket}>Adres başlığı *</label>
          <input name="title" defaultValue={duzenlenen?.title} placeholder="Ev, İş..." required className="input" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={etiket}>Ad soyad *</label>
            <input name="fullName" defaultValue={duzenlenen?.fullName ?? musteri.name ?? ""} required className="input" />
          </div>
          <div>
            <label className={etiket}>Telefon *</label>
            <input name="phone" type="tel" defaultValue={duzenlenen?.phone ?? musteri.phone ?? ""} required className="input" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={etiket}>İl *</label>
            <input name="il" defaultValue={duzenlenen?.il} required className="input" />
          </div>
          <div>
            <label className={etiket}>İlçe *</label>
            <input name="ilce" defaultValue={duzenlenen?.ilce} required className="input" />
          </div>
        </div>
        <div>
          <label className={etiket}>Açık adres *</label>
          <textarea name="adres" rows={3} defaultValue={duzenlenen?.adres} required className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isDefault" defaultChecked={duzenlenen?.isDefault} className="accent-brand-700" />
          Varsayılan adresim olsun
        </label>

        <div className="flex items-center gap-4">
          <button className="btn btn-primary px-8">KAYDET</button>
          {duzenlenen && (
            <Link href="/hesabim/adresler" className="text-sm font-semibold text-neutral-600 hover:underline">
              Vazgeç
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}