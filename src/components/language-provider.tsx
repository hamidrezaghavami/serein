"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { messages, type Locale, type MessageKey } from "@/lib/messages";
import { type Product } from "@/data/products";

const persianProducts: Record<string, { name: string; subtitle: string; description: string }> = {
  "01": { name: "تونر متعادل‌کننده", subtitle: "مایع شفاف‌کننده", description: "بافتی سبک و طراوت‌بخش، برای لحظه‌ای آرام پس از پاک‌سازی." },
  "02": { name: "مرطوب‌کنندهٔ روزانه", subtitle: "کرم مغذی", description: "کرمی نرم و دلپذیر برای کامل کردن آیین مراقبت روزانه." },
  "03": { name: "سرم آرامش", subtitle: "سرم آبرسان", description: "سرمی با بافت سبک برای اختصاص دادن کمی زمان به مراقبت روزانه." },
  "04": { name: "پاک‌کنندهٔ ملایم", subtitle: "شویندهٔ متعادل‌کننده", description: "شوینده‌ای با حس ملایم و کف لطیف؛ آیین مراقبت خود را از اینجا آغاز کنید." },
  "05": { name: "مراقبت دور چشم", subtitle: "بالم نرم‌کننده", description: "بالمی با بافت ابریشمی برای آخرین گام مراقبت روزانه." },
};

type LanguageApi = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
  number: (value: number | string) => string;
  money: (value: number) => string;
  product: (value: Product) => Product;
};

const LanguageContext = createContext<LanguageApi | null>(null);

export function LanguageProvider({ initialLocale, children }: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    document.cookie = `serein-language=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [locale]);

  const number = (value: number | string) => locale === "fa"
    ? String(value).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
    : String(value);

  const t: LanguageApi["t"] = (key, values = {}) => {
    let text: string = messages[key][locale === "fa" ? 1 : 0];
    for (const [name, value] of Object.entries(values)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  };

  const product = (value: Product): Product => locale === "fa"
    ? { ...value, ...persianProducts[value.id], size: number(value.size.replace("mL", "میلی‌لیتر")) }
    : value;

  const money = (value: number) => new Intl.NumberFormat(
    locale === "fa" ? "fa-IR" : "en-US",
    { style: "currency", currency: "USD", maximumFractionDigits: 0 }
  ).format(value);

  return <LanguageContext.Provider value={{ locale, setLocale, t, number, money, product }}>
    {children}
  </LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be inside LanguageProvider");
  return context;
}

export function LanguageSwitch() {
  const { locale, setLocale, t } = useLanguage();
  return <button
    type="button"
    className="language-switch"
    aria-label={t("switchLanguage")}
    onClick={() => setLocale(locale === "en" ? "fa" : "en")}
    dir="ltr"
  >
    <span lang="en" className={locale === "en" ? "is-active" : undefined}>EN</span>
    <span aria-hidden="true"> / </span>
    <span lang="fa" className={locale === "fa" ? "is-active" : undefined}>فارسی</span>
  </button>;
}