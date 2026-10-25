"use client";
import Link from "next/link";
import { type Product, photo } from "@/data/products";
import { useBag } from "./storefront";
import { useLanguage } from "./language-provider";

export function ProductCard({ product: original }: { product: Product }) {
  const { add, busy } = useBag();
  const { t, number, money, product } = useLanguage();
  const p = product(original);
  return <article className="product-card">
    <Link href={`/products/${p.slug}`} className="product-image" aria-label={t("viewProduct", { name: p.name })}>
      <img src={photo(p.image)} alt={p.name} loading="lazy" width="1024" height="1024" />
      <img className="product-hover-image" src={photo(p.hover)} alt={t("texture", { name: p.name })} loading="lazy" width="1024" height="1024" />
      <span className="product-number">{number(p.id)}</span>
    </Link>
    <div className="product-name-row"><Link href={`/products/${p.slug}`}><h3>{p.name}</h3></Link><span><bdi>{money(p.price)}</bdi></span></div>
    <p className="product-subtitle">{p.subtitle} · {p.size}</p>
    <button type="button" className="button-outline" disabled={busy} onClick={() => add(p.id)}>{t("add")}</button>
  </article>;
}