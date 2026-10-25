"use client";

import Link from "next/link";
import { products, photo } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { useLanguage } from "@/components/language-provider";
import type { MessageKey } from "@/lib/messages";

const steps: { name: MessageKey; id: string }[] = [
  { name: "cleanse", id: "04" }, { name: "tone", id: "01" },
  { name: "treat", id: "03" }, { name: "moisturize", id: "02" },
  { name: "eyeCare", id: "05" },
];

export default function HomePage() {
  const { locale, t, number, product } = useLanguage();
  const arrow = locale === "fa" ? "←" : "→";
  return <main>
    <section className="home-hero">
      <img className="hero-image" src={photo("mainhero.png")} alt={t("heroAlt")} width="1376" height="768" fetchPriority="high" />
      <div className="hero-copy">
        <h1>{t("heroFirst")}<br className="desktop-break" /> {t("heroSecond")}</h1>
        <p className="hero-description">{t("heroDescription")}</p>
        <Link className="button" href="/shop">{t("shopCollection")}</Link><small>{t("fiveFormulas")}</small>
      </div>
    </section>
    <section className="section collection" id="collection">
      <div className="section-heading"><div><p className="eyebrow">{t("formulas")}</p><h2>{t("essentials")}</h2></div>
        <Link className="text-link" href="/shop">{t("viewAll")} <span aria-hidden="true">{arrow}</span></Link>
      </div>
      <div className="product-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
    </section>
    <section className="section philosophy">
      <img src={photo("Brandstory.png")} alt={t("portraitAlt")} width="928" height="1152" loading="lazy" />
      <div><p className="eyebrow">{t("philosophy")}</p><h2>{t("lessNoise")}<br />{t("moreRitual")}</h2>
        <p className="section-description">{t("philosophyDescription")}</p>
        <Link className="text-link" href="/us">{t("discover")} <span aria-hidden="true">{arrow}</span></Link>
      </div>
    </section>
    <section className="section ritual" id="ritual">
      <p className="eyebrow">{t("sequence")}</p><h2>{t("rhythm")}</h2><p className="muted">{t("stepsDescription")}</p>
      <ol className="ritual-grid">{steps.map((step, index) => {
        const p = product(products.find(item => item.id === step.id)!);
        return <li key={step.id}><Link href={`/products/${p.slug}`}>
          <div className="ritual-meta"><span>{t("step")} {number(`0${index + 1}`)}</span><span>{t("formulaId")} {number(p.id)}</span></div>
          <h3>{t(step.name)}</h3><p>{p.name}</p><span className="ritual-description">{p.description}</span>
        </Link></li>;
      })}</ol>
    </section>
  </main>;
}

