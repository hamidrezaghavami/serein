"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export default function NotFound() {
  const { t, number } = useLanguage();
  return (
    <main className="section not-found-page">
      <p className="eyebrow">{number(404)}</p>
      <h1>{t("notFoundTitle")}</h1>
      <p className="muted">{t("notFoundDescription")}</p>
      <Link className="button" href="/shop">{t("continueShopping")}</Link>
    </main>
  );
}
