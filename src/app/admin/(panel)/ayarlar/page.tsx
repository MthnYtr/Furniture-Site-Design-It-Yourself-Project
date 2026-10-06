import Uyari from "@/components/Uyari";
import { ayarlariGetir } from "@/lib/ayarlar";
import { ayarKaydet } from "./actions";

export const dynamic = "force-dynamic";

const alan =
  "w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-700 focus:outline-none";
const etiket = "mb-1 block text-xs font-semibold uppercase text-neutral-600";

export default async function Ayarlar({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const a = await ayarlariGetir();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-light">Anasayfa Ayarları</h1>

      {ok && <Uyari tip="basari" baslik="Ayarlar kaydedildi">Anasayfayı yenileyip kontrol edebilirsin.</Uyari>}

      <form action={ayarKaydet} className="space-y-8">
        <section className="space-y-4 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Üstteki duyuru çubuğu</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="duyuruAktif" defaultChecked={a.duyuruAktif === "1"} />
            Duyuru çubuğunu göster
          </label>
          <div>
            <label className={etiket}>Duyurular (her satır ayrı bir yazı)</label>
            <textarea name="duyuru" rows={4} defaultValue={a.duyuru} className={alan} />
          </div>
        </section>

        <section className="space-y-4 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Ana banner (hero)</h2>
          <div>
            <label className={etiket}>Küçük rozet yazısı (boş bırakırsan görünmez)</label>
            <input name="heroRozet" defaultValue={a.heroRozet} className={alan} />
          </div>
          <div>
            <label className={etiket}>Başlık</label>
            <textarea name="heroBaslik" rows={3} defaultValue={a.heroBaslik} className={alan} />
            <p className="mt-1 text-xs text-neutral-500">
              Yeni satır için Enter. Kalın yazmak için yazıyı iki yıldız arasına al: **şu şekilde**
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={etiket}>Düğme yazısı (boş bırakırsan düğme görünmez)</label>
              <input name="heroButon" defaultValue={a.heroButon} className={alan} />
            </div>
            <div>
              <label className={etiket}>Düğme linki</label>
              <input name="heroLink" defaultValue={a.heroLink} className={alan} />
              <p className="mt-1 text-xs text-neutral-500">
                Örn: /kampanyalar veya /kategori/mutfak-dolaplari
              </p>
            </div>
          </div>
        </section>

        <button className="bg-brand-700 px-8 py-3 text-sm font-bold text-white hover:bg-brand-800">
          KAYDET
        </button>
      </form>
    </div>
  );
}