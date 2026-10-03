import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raflım | Raf, Kitaplık, Çalışma Masası ve Dolap",
  description: "Raf, kitaplık, çalışma masası, mutfak ve banyo dolapları.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-white text-neutral-800 antialiased">{children}</body>
    </html>
  );
}