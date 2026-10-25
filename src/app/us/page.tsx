"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export default function AboutPage() {
  const { t } = useLanguage();
  return <main>
    <nav className="breadcrumb" aria-label={t("breadcrumb")}><Link href="/">{t("home")}</Link><span>/</span><span>{t("story")}</span></nav>
    <section className="about-hero"><h1>{t("about")}</h1><img src="/images/us/US-pic.png" alt={t("aboutAlt")} width="1376" height="768" fetchPriority="high" /></section>
    <section className="section story-section"><img src="/images/us/Ritualdetail.png" alt={t("ritualAlt")} width="928" height="1152" loading="lazy" />
      <div><p className="eyebrow">{t("story")}</p><h2>{t("tagline")}</h2>
        <div className="editorial-copy"><p>{t("storyOne")}</p><p>{t("storyTwo")}</p><p>{t("storyThree")}</p></div>
        <small className="edition">— {t("edition")}</small>
      </div>
    </section>
    <section className="skin-banner"><img src="/images/us/Asianmodel.png" alt={t("skinAlt")} width="1792" height="592" loading="lazy" />
      <div><h2>{t("lessNoise")}<br />{t("moreRitual")}</h2><p>{t("bannerDescription")}</p></div>
    </section>
    <section className="closing-section" id="faq"><h2>{t("ownPace")}</h2><p>{t("noPerfect")}</p>
      <Link href="/shop" className="button">{t("explore")}</Link>
      <details className="demo-faq"><summary>{t("purchaseQuestion")}</summary><p>{t("purchaseAnswer")}</p></details>
    </section>
  </main>;
}