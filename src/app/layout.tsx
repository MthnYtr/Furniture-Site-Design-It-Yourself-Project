import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Raflım | Raf, Kitaplık, Çalışma Masası ve Dolap",
  description: "Raf, kitaplık, çalışma masası, mutfak ve banyo dolapları.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-white text-neutral-800 antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}