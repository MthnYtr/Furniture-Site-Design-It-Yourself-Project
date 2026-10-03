import Link from "next/link";
import { redirect } from "next/navigation";
import { destroySession, isAdmin } from "@/lib/auth";

async function cikis() {
  "use server";
  await destroySession();
  redirect("/admin/login");
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="w-56 shrink-0 bg-[#3b4149] p-5 text-sm text-white">
        <div className="mb-8 text-lg tracking-widest">YÖNETİM</div>
        <nav className="flex flex-col gap-3">
          <Link href="/admin" className="hover:text-amber-300">Genel Bakış</Link>
          <Link href="/admin/urunler" className="hover:text-amber-300">Ürünler</Link>
          <Link href="/admin/kategoriler" className="hover:text-amber-300">Kategoriler</Link>
          <Link href="/admin/siparisler" className="hover:text-amber-300">Siparişler</Link>
          <Link href="/" className="mt-6 text-neutral-300 hover:text-white">← Siteyi gör</Link>
        </nav>
        <form action={cikis} className="mt-8">
          <button className="text-neutral-300 hover:text-white">Çıkış yap</button>
        </form>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}