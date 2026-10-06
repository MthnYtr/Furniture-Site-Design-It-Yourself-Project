import { redirect } from "next/navigation";
import { mevcutMusteri } from "@/lib/musteri";
import HesapMenu from "@/components/HesapMenu";
import { cikisYap } from "../uye/actions";

export const dynamic = "force-dynamic";

export default async function HesapLayout({ children }: { children: React.ReactNode }) {
  const musteri = await mevcutMusteri();
  if (!musteri) redirect("/uye/giris?next=/hesabim");

  const harf = (musteri.name ?? musteri.email).trim().charAt(0).toLocaleUpperCase("tr-TR");

  return (
    <main className="mx-auto max-w-330 px-4 py-6 md:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4 md:p-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white">
            {harf}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold md:text-xl">{musteri.name ?? "Hesabım"}</h1>
            <p className="truncate text-sm text-neutral-500">{musteri.email}</p>
          </div>
        </div>

        <form action={cikisYap}>
          <button className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9" />
            </svg>
            Çıkış yap
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8">
        <HesapMenu />
        <div>{children}</div>
      </div>
    </main>
  );
}