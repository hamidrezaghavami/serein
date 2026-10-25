import { AuthProvider } from "@/components/auth-provider";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Storefront } from "@/components/storefront";
import { LanguageProvider } from "@/components/language-provider";
import MotionEffects from "@/components/motion-effects";
import BubbleCursor from "@/components/bubble-cursor";

export const metadata: Metadata = {
  title: { default: "SEREIN — A quieter kind of care", template: "%s | SEREIN" },
  description: "SEREIN skincare portfolio demo · سرن، نمونه‌کار مراقبت از پوست",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("serein-language")?.value === "fa" ? "fa" : "en";

  return <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"} data-scroll-behavior="smooth">
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Plus+Jakarta+Sans:wght@400;500;600&family=Vazirmatn:wght@400;500;600&display=swap" rel="stylesheet" />
    </head>
    <body>
      <LanguageProvider initialLocale={locale}>
        <AuthProvider><Storefront>{children}</Storefront></AuthProvider>
        <BubbleCursor />
        <MotionEffects />
      </LanguageProvider>
    </body>
  </html>;
}