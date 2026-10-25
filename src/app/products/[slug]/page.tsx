"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, photo } from "@/data/products";
import { AddToBag } from "@/components/storefront";
import { useLanguage } from "@/components/language-provider";

export default function ProductPage({ params }: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const original = products.find(item => item.slug === slug);
  if (!original) notFound();
  const { t, number, money, product } = useLanguage();
  const p = product(original);
  return <main className="section product-page">
    <nav className="breadcrumb" aria-label={t("breadcrumb")}><Link href="/shop">{t("shop")}</Link><span>/</span><span>{p.name}</span></nav>
    <div className="product-detail-grid"><div className="product-gallery">
      <img src={photo(p.image)} alt={p.name} width="1024" height="1024" />
      <img src={photo(p.hover)} alt={t("texture", { name: p.name })} width="1024" height="1024" loading="lazy" />
    </div><div className="product-detail-copy">
      <p className="eyebrow">{t("formula")} {number(p.id)} · {p.size}</p><h1>{p.name}</h1>
      <p>{p.subtitle}</p><p className="detail-price"><bdi>{money(p.price)}</bdi></p><p>{p.description}</p>
      <AddToBag id={p.id} /><p className="muted">{t("fictionalProduct")}</p>
      <details><summary>{t("ritual")}</summary><p>{t("ritualNote")}</p></details>
      <details><summary>{t("notes")}</summary><p>{t("formulaNote")}</p></details>
    </div></div>
  </main>;
}
