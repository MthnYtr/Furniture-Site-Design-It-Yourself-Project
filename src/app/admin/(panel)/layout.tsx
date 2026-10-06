import Link from "next/link";
import { redirect } from "next/navigation";
import { destroySession, isAdmin } from "@/lib/auth";
import AdminMenu from "@/components/admin/AdminMenu";

async function cikis() {
  "use server";
  await destroySession();
  redirect("/admin/login");
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-neutral-100 md:flex">
      <aside className="flex flex-col bg-brand-900 text-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:overflow-y-auto">
        <div className="px-5 py-4 md:py-6">
          <div className="text-xl font-light tracking-[0.25em]">RAFLIM</div>
          <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-brand-300">
            Yönetim paneli
          </div>
        </div>

        <AdminMenu />

        <div className="flex items-center gap-4 border-t border-white/10 px-5 py-4 text-sm md:mt-auto md:flex-col md:items-start md:gap-3">
          <Link href="/" className="text-brand-200 transition-colors hover:text-white">
            &larr; Siteyi gör
          </Link>
          <form action={cikis}>
            <button className="text-brand-200 transition-colors hover:text-white">Çıkış yap</button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}