"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MotionEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const preference = matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (preference.matches) return;

    const managed = new Set<HTMLElement>();
    const hero = document.querySelector<HTMLElement>(".home-hero");
    const header = document.querySelector<HTMLElement>(".site-header");
    const main = document.querySelector<HTMLElement>("#content main");

    // A soft entrance when opening a page.
    const entrance = main?.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 380, easing: "ease-out" }
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const element = entry.target as HTMLElement;
          element.dataset.sereinVisible = "true";

          observer.unobserve(element);
        }
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    const reveal = (selector: string, type: string) => {
      document.querySelectorAll<HTMLElement>(selector).forEach(
        (element) => {
          if (managed.has(element)) return;

          managed.add(element);
          element.dataset.sereinReveal = type;

          const belowScreen =
            element.getBoundingClientRect().top >= innerHeight;

          element.dataset.sereinVisible = String(!belowScreen);

          if (belowScreen) observer.observe(element);
        }
      );
    };

    const scan = () => {
      reveal(
        ".philosophy > img, .story-section > img, .product-gallery > img",
        "image"
      );

      reveal(
        ".section-heading, .philosophy > div, .story-section > div, .closing-section > h2, .ritual > h2",
        "text"
      );
    };

    // Only pin the hero when its entire content fits on screen.
    const measure = () => {
      if (!hero) return;

      const headerHeight =
        header?.getBoundingClientRect().height ?? 80;

      const fits =
        innerWidth > 700 &&
        hero.getBoundingClientRect().height <=
          innerHeight - headerHeight;

      hero.dataset.sereinStack = String(fits);

      hero.style.setProperty(
        "--serein-header-height",
        `${headerHeight}px`
      );
    };

    scan();
    measure();

    const resize = new ResizeObserver(measure);

    if (hero) resize.observe(hero);
    if (header) resize.observe(header);

    window.addEventListener("resize", measure);

    const mutations = new MutationObserver(scan);
    const content = document.getElementById("content");

    if (content) {
      mutations.observe(content, {
        childList: true,
        subtree: true,
      });
    }

    const clear = () => {
      observer.disconnect();
      resize.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", measure);
      entrance?.cancel();

      for (const element of managed) {
        delete element.dataset.sereinReveal;
        delete element.dataset.sereinVisible;
      }

      if (hero) {
        delete hero.dataset.sereinStack;
        hero.style.removeProperty("--serein-header-height");
      }
    };

    const changePreference = () => {
      if (preference.matches) clear();
    };

    preference.addEventListener("change", changePreference);

    return () => {
      preference.removeEventListener("change", changePreference);
      clear();
    };
  }, [pathname]);

  return null;
}