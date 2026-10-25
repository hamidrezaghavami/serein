"use client";

import { products } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { useLanguage } from "@/components/language-provider";

export default function ShopPage() {
  const { t } = useLanguage();
  return <main className="section shop-page"><p className="eyebrow">{t("collection")}</p><h1>{t("essentials")}</h1>
    <p className="muted">{t("collectionDescription")}</p>
    <div className="product-grid">{products.map(p => <ProductCard product={p} key={p.id} />)}</div>
  </main>;
}