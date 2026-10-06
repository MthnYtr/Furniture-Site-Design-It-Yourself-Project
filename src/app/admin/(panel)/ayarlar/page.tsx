import Uyari from "@/components/Uyari";
import { ayarlariGetir } from "@/lib/ayarlar";
import { ayarKaydet } from "./actions";

export const dynamic = "force-dynamic";

const etiket = "mb-1 block text-xs font-semibold text-neutral-600";

export default async function Ayarlar({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const a = await ayarlariGetir();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-brand-900">Anasayfa Ayarları</h1>
      <p className="mb-6 text-sm text-neutral-500">Üstteki duyuru çubuğunu ve ana banner yazılarını buradan değiştirebilirsin.</p>

      {ok && (
        <Uyari tip="basari" baslik="Ayarlar kaydedildi">
          Anasayfayı yenileyip kontrol edebilirsin.
        </Uyari>
      )}

      <form action={ayarKaydet} className="space-y-5">
        <section className="card space-y-4 p-5">
          <h2 className="font-bold text-brand-900">Üstteki duyuru çubuğu</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="duyuruAktif" defaultChecked={a.duyuruAktif === "1"} />
            Duyuru çubuğunu göster
          </label>
          <div>
            <label className={etiket}>Duyurular (her satır ayrı bir yazı)</label>
            <textarea name="duyuru" rows={4} defaultValue={a.duyuru} className="input" />
          </div>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-bold text-brand-900">Ana banner (hero)</h2>
          <div>
            <label className={etiket}>Küçük rozet yazısı (boş bırakırsan görünmez)</label>
            <input name="heroRozet" defaultValue={a.heroRozet} className="input" />
          </div>
          <div>
            <label className={etiket}>Başlık</label>
            <textarea name="heroBaslik" rows={3} defaultValue={a.heroBaslik} className="input" />
            <p className="mt-1 text-xs text-neutral-500">
              Yeni satır için Enter. Kalın yazmak için yazıyı iki yıldız arasına al: **şu şekilde**
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={etiket}>Düğme yazısı (boş bırakırsan düğme görünmez)</label>
              <input name="heroButon" defaultValue={a.heroButon} className="input" />
            </div>
            <div>
              <label className={etiket}>Düğme linki</label>
              <input name="heroLink" defaultValue={a.heroLink} className="input" />
              <p className="mt-1 text-xs text-neutral-500">Örn: /kampanyalar veya /kategori/mutfak-dolaplari</p>
            </div>
          </div>
        </section>

        <button className="btn btn-primary px-8 py-3">Kaydet</button>
      </form>
    </div>
  );
}