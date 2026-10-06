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
    <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-900">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        Kayıtlı adreslerim
      </label>
      <select defaultValue="" onChange={sec} className="input">
        <option value="">Kayıtlı adreslerimden seç...</option>
        {adresler.map((a) => (
          <option key={a.id} value={a.id}>
            {a.title} — {a.ilce} / {a.il}
          </option>
        ))}
      </select>
    </div>
  );
}