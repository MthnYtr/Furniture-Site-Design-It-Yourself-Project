type Props = {
  tip: "hata" | "basari" | "uyari";
  baslik: string;
  children?: React.ReactNode;
};

const STILLER = {
  hata: { kutu: "border-red-600 bg-red-50 text-red-800", ikon: "bg-red-600", isaret: "!" },
  basari: { kutu: "border-green-600 bg-green-50 text-green-800", ikon: "bg-green-600", isaret: "✓" },
  uyari: { kutu: "border-amber-500 bg-amber-50 text-amber-900", ikon: "bg-amber-500", isaret: "!" },
};

export default function Uyari({ tip, baslik, children }: Props) {
  const s = STILLER[tip];
  return (
    <div
      role={tip === "basari" ? "status" : "alert"}
      className={`mb-5 flex items-start gap-3 rounded-r-md border-l-4 px-4 py-4 shadow-sm ${s.kutu}`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${s.ikon}`}
      >
        {s.isaret}
      </span>
      <div>
        <div className="text-sm font-bold">{baslik}</div>
        {children && <div className="mt-0.5 text-sm">{children}</div>}
      </div>
    </div>
  );
}