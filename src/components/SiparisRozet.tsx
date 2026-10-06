import { DURUM_ADI, type Durum } from "@/lib/siparis";

export default function SiparisRozet({ durum }: { durum: string }) {
  const ad = DURUM_ADI[durum as Durum] ?? durum;
  const renk =
    durum === "CANCELLED"
      ? "bg-red-50 text-red-700"
      : durum === "DELIVERED"
        ? "bg-green-50 text-green-700"
        : durum === "SHIPPED"
          ? "bg-brand-100 text-brand-800"
          : "bg-amber-50 text-amber-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${renk}`}>{ad}</span>
  );
}