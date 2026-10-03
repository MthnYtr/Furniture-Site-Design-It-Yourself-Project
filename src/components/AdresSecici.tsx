"use client";

type Adres = {
  id: number;
  title: string;
  fullName: string;
  phone: string;
  il: string;
  ilce: string;
  adres: string;
};

export default function AdresSecici({ adresler }: { adresler: Adres[] }) {
  function sec(e: React.ChangeEvent<HTMLSelectElement>) {
    const a = adresler.find((x) => x.id === Number(e.target.value));
    const form = e.target.form;
    if (!a || !form) return;

    const yaz = (ad: string, deger: string) => {
      const el = form.elements.namedItem(ad) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el) el.value = deger;
    };
    yaz("fullName", a.fullName);
    yaz("phone", a.phone);
    yaz("il", a.il);
    yaz("ilce", a.ilce);
    yaz("adres", a.adres);
  }

  return (
    <select
      defaultValue=""
      onChange={sec}
      className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm"
    >
      <option value="">Kayıtlı adreslerimden seç...</option>
      {adresler.map((a) => (
        <option key={a.id} value={a.id}>
          {a.title} — {a.ilce} / {a.il}
        </option>
      ))}
    </select>
  );
}