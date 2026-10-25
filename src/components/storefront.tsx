"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { products, photo } from "@/data/products";
import { LanguageSwitch, useLanguage } from "./language-provider";

const clampQuantity = (value: number) =>
  Math.max(1, Math.min(20, Number.isFinite(value) ? Math.trunc(value) : 1));

type Cart = Record<string, number>;
type BagApi = { add: (id: string, quantity?: number) => void };
const BagContext = createContext<BagApi>({ add: () => {} });
export const useBag = () => useContext(BagContext);

export function AddProduct({ id }: { id: string }) {
  const { add } = useBag();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  return <div className="add-to-bag">
    <label>{t("quantity")}<input type="number" min="1" max="20" step="1" value={quantity}
      onChange={event => setQuantity(clampQuantity(Number(event.target.value)))} /></label>
    <button type="button" className="button" onClick={() => add(id, quantity)}>{t("add")}</button>
  </div>;
}

export function Storefront({ children }: { children: React.ReactNode }) {
  const { locale, t, number, money, product } = useLanguage();
  const [cart, setCart] = useState<Cart>({});
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("serein-bag") || "{}");
      const valid: Cart = {};
      for (const item of products) {
        if (Number.isInteger(saved?.[item.id]) && saved[item.id] > 0) {
          valid[item.id] = Math.min(saved[item.id], 20);
        }
      }
      setCart(valid);
    } catch { /* Start with an empty bag if browser storage is unavailable. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try { localStorage.setItem("serein-bag", JSON.stringify(cart)); } catch {}
    }
  }, [cart, ready]);

  useEffect(() => { setMenu(false); }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) {
        setMenu(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menu]);

  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const total = products.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0);
  const open = () => {
    setMenu(false);
    setCheckout(false);
    setPlaced(false);
    if (!dialog.current?.open) dialog.current?.showModal();
  };
  const add = (id: string, quantity = 1) => {
    if (!products.some(item => item.id === id)) return;
    setCart(current => ({ ...current, [id]: clampQuantity((current[id] || 0) + clampQuantity(quantity)) }));
    open();
  };
  const update = (id: string, quantity: number) => setCart(current => {
    const next = { ...current };
    if (quantity <= 0) delete next[id];
    else next[id] = clampQuantity(quantity);
    return next;
  });

  return <BagContext.Provider value={{ add }}>
    <a className="skip-link" href="#content">{t("skip")}</a>
    <header ref={header} className="site-header">
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label={`SEREIN · ${t("home")}`} dir="ltr">SEREIN</Link>
        <button ref={menuButton} type="button" className="menu-button" aria-label={t(menu ? "closeMenu" : "openMenu")}
          aria-expanded={menu} aria-controls="main-nav" onClick={() => setMenu(!menu)}>{menu ? "✕" : "☰"}</button>
        <nav id="main-nav" className={`main-navigation${menu ? " is-open" : ""}`} aria-label={t("mainNav")} onClick={() => setMenu(false)}>
          <Link href="/shop" aria-current={pathname === "/shop" ? "page" : undefined}>{t("shop")}</Link>
          <Link href="/us" aria-current={pathname === "/us" ? "page" : undefined}>{t("story")}</Link>
          <Link href="/#ritual" onClick={() => setMenu(false)}>{t("ritual")}</Link>
        </nav>
        <div className="header-actions">
          <LanguageSwitch />
          <button type="button" className="bag-button" onClick={open} aria-label={t("openBag", { count: number(count) })}>
            <svg width="16" height="18" viewBox="0 0 20 22" fill="none" aria-hidden="true"><path d="M3 7h14l1 13H2L3 7ZM7 8V5a3 3 0 0 1 6 0v3" stroke="currentColor" /></svg>
            <span>{t("bag")} ({number(count)})</span>
          </button>
        </div>
      </div>
    </header>
    <div id="content" tabIndex={-1}>{children}</div>
    <footer>
      <div className="footer-main">
        <div>
          <Link href="/" className="footer-wordmark" dir="ltr">SEREIN</Link>
          <p className="footer-tagline">{t("tagline")}</p>
          <nav aria-label={t("footerNav")}>
            <Link href="/shop">{t("shop")}</Link><Link href="/us">{t("story")}</Link>
            <Link href="/#ritual">{t("ritual")}</Link><Link href="/us#faq">{t("faq")}</Link>
          </nav>
        </div>
        <form className="newsletter" onSubmit={event => { event.preventDefault(); setSubscribed(true); }}>
          <label htmlFor="newsletter">{t("newsletterTitle")}</label>
          <p>{t("newsletterDemo")}</p>
          <input id="newsletter" type="email" required placeholder={t("emailPlaceholder")} aria-label={t("email")}
            autoComplete="email" dir="ltr" />
          <button className="button-outline" type="submit">{t("subscribe")}</button>
          <p role="status">{subscribed ? t("newsletterThanks") : ""}</p>
        </form>
      </div>
      <div className="footer-bottom">
        <span>© {number(new Date().getFullYear())} SEREIN. {t("rights")}</span>
        <span>{t("portfolio")}</span><span>{t("designed")}</span>
      </div>
    </footer>
    <dialog ref={dialog} className="cart-dialog" aria-labelledby="bag-title" dir={locale === "fa" ? "rtl" : "ltr"}
      onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="cart-drawer">
        <div className="cart-heading">
          <h2 id="bag-title">{t(placed ? "thankYou" : checkout ? "checkout" : "shoppingBag")}</h2>
          <button type="button" aria-label={t("closeBag")} onClick={() => dialog.current?.close()}>✕</button>
        </div>
        {placed ? <div className="cart-empty">
          <h3>{t("onWay")}</h3><p>{t("orderPlaced")}</p>
          <button type="button" className="button" onClick={() => dialog.current?.close()}>{t("continueExploring")}</button>
        </div> : checkout ? <form className="checkout-form" onSubmit={event => {
          event.preventDefault(); if (!count) return; setCart({}); setPlaced(true);
        }}>
          <p>{t("checkoutIntro")}</p>
          <label>{t("name")}<input required defaultValue="Alex Example" maxLength={100} /></label>
          <label>{t("email")}<input type="email" required defaultValue="alex@example.com" maxLength={150} dir="ltr" /></label>
          <label>{t("address")}<input required defaultValue="123 Example Street" maxLength={200} /></label>
          <div className="cart-total"><span>{t("total")}</span><strong><bdi>{money(total)}</bdi></strong></div>
          <p className="muted">{t("shipping")}</p>
          <button className="button" type="submit">{t("placeOrder")}</button>
          <button type="button" className="text-link" onClick={() => setCheckout(false)}>{t("backToBag")}</button>
        </form> : count ? <>
          <div>{products.filter(item => cart[item.id]).map(item => {
            const p = product(item);
            return <article className="cart-item" key={p.id}>
              <img src={photo(p.image)} alt={p.name} width="100" height="100" />
              <div><h3>{p.name}</h3><p>{p.size} · <bdi>{money(p.price)}</bdi></p>
                <div className="quantity-controls">
                  <button type="button" aria-label={t("decrease", { name: p.name })} onClick={() => update(p.id, cart[p.id] - 1)}>−</button>
                  <span>{number(cart[p.id])}</span>
                  <button type="button" aria-label={t("increase", { name: p.name })} disabled={cart[p.id] >= 20} onClick={() => update(p.id, cart[p.id] + 1)}>+</button>
                  <button type="button" className="remove-button" onClick={() => update(p.id, 0)}>{t("remove")}</button>
                </div>
              </div>
            </article>;
          })}</div>
          <div className="cart-summary">
            <div className="cart-total"><span>{t("subtotal")}</span><strong><bdi>{money(total)}</bdi></strong></div>
            <p>{t("demoOnly")}</p>
            <button type="button" className="button" onClick={() => setCheckout(true)}>{t("continueCheckout")}</button>
          </div>
        </> : <div className="cart-empty">
          <h3>{t("roomForRitual")}</h3><p>{t("empty")}</p>
          <button type="button" className="button" onClick={() => dialog.current?.close()}>{t("continueShopping")}</button>
        </div>}
      </div>
    </dialog>
  </BagContext.Provider>;
}

// Retain the original component name used by product pages.
export const AddToBag = AddProduct;