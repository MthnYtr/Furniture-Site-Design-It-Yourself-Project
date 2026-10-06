import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SITE_URL } from "@/lib/seo";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.ad} | Raf, Kitaplık, Çalışma Masası ve Dolap`,
    template: `%s | ${SITE.ad}`,
  },
  description: "Raf, kitaplık, çalışma masası, mutfak ve banyo dolapları.",
  openGraph: {
    siteName: SITE.ad,
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}