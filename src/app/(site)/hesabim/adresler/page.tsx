import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mevcutMusteri } from "@/lib/musteri";
import { adresKaydet, adresSil, varsayilanYap } from "./actions";

export const dynamic = "force-dynamic";

const alan = "w-full border border-neutral-300 px-3 py-2 text-sm";
const etiket = "mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600";

const HATALAR: Record<string, string> = {
  eksik: "Lütfen tüm alanları doğru doldur (telefon en az 10 haneli olmalı).",
  cok: "En fazla 10 adres kaydedebilirsin. Önce birini sil.",
};

export default async function Adreslerim({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; duzenle?: string }>;
}) {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim/adresler");

  const { hata, duzenle } = await searchParams;

  const adresler = await prisma.address.findMany({
    where: { userId: musteri.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  const duzenlenen = duzenle ? adresler.find((a) => a.id === Number(duzenle)) : undefined;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Adreslerim ({adresler.length})</h2>

      {hata && <p className="mb-4 bg-red-50 p-3 text-sm text-red-600">{HATALAR[hata] ?? "Bir sorun oluştu."}</p>}

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {adresler.length === 0 && (
          <p className="text-sm text-neutral-500">Henüz kayıtlı adresin yok. Aşağıdan ekleyebilirsin.</p>
        )}
        {adresler.map((a) => (
          <div key={a.id} className="border border-neutral-200 p-4 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold">{a.title}</span>
              {a.isDefault && (
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                  Varsayılan
                </span>
              )}
            </div>
            <div>{a.fullName} · {a.phone}</div>
            <div className="text-neutral-600">
              {a.adres}, {a.ilce} / {a.il}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
              <Link href={`/hesabim/adresler?duzenle=${a.id}`} className="text-teal-700 hover:underline">
                Düzenle
              </Link>
              {!a.isDefault && (
                <form action={varsayilanYap}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-teal-700 hover:underline">Varsayılan yap</button>
                </form>
              )}
              <form action={adresSil}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-red-600 hover:underline">Sil</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <form
        key={duzenlenen?.id ?? "yeni"}
        action={adresKaydet}
        className="max-w-xl space-y-4 border border-neutral-200 p-5"
      >
        <h3 className="font-semibold">{duzenlenen ? "Adresi düzenle" : "Yeni adres ekle"}</h3>
        <input type="hidden" name="id" value={duzenlenen?.id ?? ""} />

        <div>
          <label className={etiket}>Adres başlığı *</label>
          <input name="title" defaultValue={duzenlenen?.title} placeholder="Ev, İş..." required className={alan} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={etiket}>Ad soyad *</label>
            <input name="fullName" defaultValue={duzenlenen?.fullName ?? musteri.name ?? ""} required className={alan} />
          </div>
          <div>
            <label className={etiket}>Telefon *</label>
            <input name="phone" type="tel" defaultValue={duzenlenen?.phone ?? musteri.phone ?? ""} required className={alan} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={etiket}>İl *</label>
            <input name="il" defaultValue={duzenlenen?.il} required className={alan} />
          </div>
          <div>
            <label className={etiket}>İlçe *</label>
            <input name="ilce" defaultValue={duzenlenen?.ilce} required className={alan} />
          </div>
        </div>
        <div>
          <label className={etiket}>Açık adres *</label>
          <textarea name="adres" rows={3} defaultValue={duzenlenen?.adres} required className={alan} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isDefault" defaultChecked={duzenlenen?.isDefault} />
          Varsayılan adresim olsun
        </label>

        <div className="flex items-center gap-4">
          <button className="bg-teal-700 px-6 py-2 text-sm font-bold text-white hover:bg-teal-800">
            KAYDET
          </button>
          {duzenlenen && (
            <Link href="/hesabim/adresler" className="text-sm text-neutral-600 hover:underline">
              Vazgeç
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}