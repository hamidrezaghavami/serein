"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { products, photo } from "@/data/products";
import { ApiError, apiRequest, type ApiCart } from "@/lib/api";
import { messages } from "@/lib/messages";
import { LanguageSwitch, useLanguage } from "./language-provider";
import { AuthControls } from "./auth-controls";

const clampQuantity = (value: number) =>
  Math.max(1, Math.min(20, Number.isFinite(value) ? Math.trunc(value) : 1));

type Cart = Record<string, number>;
type BagApi = { add: (id: string, quantity?: number) => void; busy: boolean };
const BagContext = createContext<BagApi>({ add: () => {}, busy: false });
export const useBag = () => useContext(BagContext);

export function AddProduct({ id }: { id: string }) {
  const { add, busy } = useBag();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  return <div className="add-to-bag">
    <label>{t("quantity")}<input type="number" min="1" max="20" step="1" value={quantity}
      onChange={event => setQuantity(clampQuantity(Number(event.target.value)))} /></label>
    <button type="button" className="button" disabled={busy} onClick={() => add(id, quantity)}>{t("add")}</button>
  </div>;
}

export function Storefront({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const { locale, t, number, money, product } = useLanguage();
  const [cart, setCart] = useState<Cart>({});
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const [ready, setReady] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const [cartPending, setCartPending] = useState(0);
  const [serverTotalCents, setServerTotalCents] = useState(0);
  const [cartRetry, setCartRetry] = useState(0);
  const [cartError, setCartError] = useState("");
  const [menu, setMenu] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [shipping, setShipping] = useState({ name: "", email: "", address: "" });
  const [newsletterState, setNewsletterState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [newsletterError, setNewsletterError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const cartQueue = useRef<Promise<void>>(Promise.resolve());
  const failedCartMutations = useRef<{ id: string; quantity: number }[]>([]);
  const hydratedOwner = useRef<string | null>(null);
  const previousSignedIn = useRef(false);
  const orderAttempt = useRef<{ body: string; key: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      // A previous signed-in user's bag must never appear as a guest bag.
      const owner = localStorage.getItem("serein-bag-owner");
      const saved = owner ? {} : JSON.parse(localStorage.getItem("serein-bag") || "{}");
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
    if (!ready || !isLoaded || isSignedIn || localStorage.getItem("serein-bag-owner")) return;
    try { localStorage.setItem("serein-bag", JSON.stringify(cart)); } catch {}
  }, [cart, ready, isLoaded, isSignedIn]);

  // Guests keep a browser cart. Signed-in carts are stored only by the API.
  useEffect(() => {
    if (!ready || !isLoaded) return;
    if (!isSignedIn || !userId) {
      if (previousSignedIn.current || localStorage.getItem("serein-bag-owner")) {
        setCart({});
        setServerTotalCents(0);
        localStorage.removeItem("serein-bag");
        localStorage.removeItem("serein-bag-owner");
      } else {
        try { localStorage.setItem("serein-bag", JSON.stringify(cartRef.current)); } catch {}
      }
      previousSignedIn.current = false;
      hydratedOwner.current = null;
      setCartReady(true);
      return;
    }

    previousSignedIn.current = true;
    if (hydratedOwner.current === userId) return;
    let active = true;
    setCartReady(false);
    setCartError("");
    void (async () => {
      try {
        const token = await getToken();
        if (!token) throw new ApiError("UNAUTHENTICATED", 401);
        const server = await apiRequest<{ data: ApiCart }>(`/cart?locale=${locale}`, { token });
        const owner = localStorage.getItem("serein-bag-owner");
        const guest = owner ? {} : cartRef.current;
        const merged: Cart = {};
        for (const item of server.data.items) merged[item.product.id] = item.quantity;
        // Merge guest quantities into the account cart, capped by the API's per-item limit.
        for (const [id, quantity] of Object.entries(guest)) {
          merged[id] = clampQuantity((merged[id] || 0) + quantity);
        }
        let latest = server.data;
        for (const [id, quantity] of Object.entries(merged)) {
          const result = await apiRequest<{ data: ApiCart }>(`/cart/items/${id}`, {
            token, method: "PUT", body: { quantity },
          });
          latest = result.data;
        }
        if (!active) return;
        setCart(merged);
        setServerTotalCents(latest.subtotalCents);
        localStorage.removeItem("serein-bag");
        localStorage.setItem("serein-bag-owner", userId);
        hydratedOwner.current = userId;
      } catch {
        if (active) setCartError(messages.bagConnectionError[locale === "fa" ? 1 : 0]);
      } finally {
        if (active) setCartReady(true);
      }
    })();
    return () => { active = false; };
  }, [ready, isLoaded, isSignedIn, userId, getToken, locale, cartRetry]);

  useEffect(() => {
    if (user?.fullName || user?.primaryEmailAddress?.emailAddress) {
      setShipping(current => ({
        name: current.name || user.fullName || "",
        email: current.email || user.primaryEmailAddress?.emailAddress || "",
        address: current.address,
      }));
    }
  }, [user?.fullName, user?.primaryEmailAddress?.emailAddress]);

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
      if (event.target instanceof Node && !header.current?.contains(event.target)) setMenu(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menu]);

  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const localTotalCents = products.reduce((sum, item) => sum + item.price * 100 * (cart[item.id] || 0), 0);
  const totalCents = isSignedIn ? serverTotalCents : localTotalCents;
  const busy = !ready || !isLoaded || !cartReady || cartPending > 0 || Boolean(cartError) || checkoutBusy;
  const open = () => {
    setMenu(false);
    setCheckout(false);
    setPlaced(false);
    setCheckoutError("");
    if (!dialog.current?.open) dialog.current?.showModal();
  };

  const queueCartMutation = (id: string, quantity: number) => {
    if (!isSignedIn) return;
    setCartPending(value => value + 1);
    cartQueue.current = cartQueue.current.catch(() => {}).then(async () => {
      const token = await getToken();
      if (!token) throw new ApiError("UNAUTHENTICATED", 401);
      const response = quantity <= 0
        ? await apiRequest<{ data: ApiCart }>(`/cart/items/${id}?locale=${locale}`, { token, method: "DELETE" })
        : await apiRequest<{ data: ApiCart }>(`/cart/items/${id}?locale=${locale}`, { token, method: "PUT", body: { quantity } });
      setServerTotalCents(response.data.subtotalCents);
      setCartError("");
    });
    void cartQueue.current.catch(() => {
      failedCartMutations.current.push({ id, quantity });
      setCartError(t("bagConnectionError"));
    }).finally(() => setCartPending(value => Math.max(0, value - 1)));
  };

  async function retryCart() {
    if (!isSignedIn || cartPending) return;
    setCartError("");
    setCartPending(1);
    try {
      const token = await getToken();
      if (!token) throw new ApiError("UNAUTHENTICATED", 401);
      const failed = [...failedCartMutations.current];
      if (failed.length) {
        let result: { data: ApiCart } | undefined;
        for (const mutation of failed) {
          result = mutation.quantity <= 0
            ? await apiRequest<{ data: ApiCart }>(`/cart/items/${mutation.id}?locale=${locale}`, { token, method: "DELETE" })
            : await apiRequest<{ data: ApiCart }>(`/cart/items/${mutation.id}?locale=${locale}`, { token, method: "PUT", body: { quantity: mutation.quantity } });
        }
        if (result) setServerTotalCents(result.data.subtotalCents);
        failedCartMutations.current = [];
      } else {
        hydratedOwner.current = null;
        setCartReady(false);
        // Re-run the initial guest/account reconciliation.
        setCartRetry(value => value + 1);
      }
    } catch {
      setCartError(t("bagConnectionError"));
    } finally { setCartPending(0); }
  }

  const add = (id: string, quantity = 1) => {
    if (!cartReady || !products.some(item => item.id === id)) return;
    const nextQuantity = clampQuantity((cartRef.current[id] || 0) + clampQuantity(quantity));
    const next = { ...cartRef.current, [id]: nextQuantity };
    cartRef.current = next;
    setCart(next);
    queueCartMutation(id, nextQuantity);
    open();
  };
  const update = (id: string, quantity: number) => {
    const next = { ...cartRef.current };
    if (quantity <= 0) delete next[id];
    else next[id] = clampQuantity(quantity);
    cartRef.current = next;
    setCart(next);
    queueCartMutation(id, quantity);
  };

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!count || checkoutBusy) return;
    if (!isSignedIn) return;
    const body = JSON.stringify({ shipping: {
      name: shipping.name.trim(), email: shipping.email.trim(), address: shipping.address.trim(),
    } });
    if (!orderAttempt.current || orderAttempt.current.body !== body) {
      orderAttempt.current = { body, key: crypto.randomUUID() };
    }
    const attempt = orderAttempt.current;
    setCheckoutBusy(true);
    setCheckoutError("");
    try {
      const token = await getToken();
      if (!token) throw new ApiError("UNAUTHENTICATED", 401);
      await apiRequest(`/orders?locale=${locale}`, {
        token, method: "POST", body: JSON.parse(body),
        headers: { "Idempotency-Key": attempt.key },
      });
      setCart({});
      cartRef.current = {};
      setServerTotalCents(0);
      orderAttempt.current = null;
      setPlaced(true);
    } catch {
      setCheckoutError(t("orderConnectionError"));
    } finally { setCheckoutBusy(false); }
  }

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newsletterState === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setNewsletterState("submitting");
    setNewsletterError("");
    try {
      await apiRequest("/newsletter", {
        public: true, method: "POST",
        body: { email: String(data.get("email") || ""), locale, consent: data.get("consent") === "on" },
      });
      form.reset();
      setNewsletterState("success");
    } catch {
      setNewsletterError(t("newsletterError"));
      setNewsletterState("error");
    }
  }

  return <BagContext.Provider value={{ add, busy }}>
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
          <AuthControls />
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
        <form className="newsletter" onSubmit={subscribe}>
          <label htmlFor="newsletter-email">{t("newsletterTitle")}</label>
          <p>{t("newsletterConsentNote")}</p>
          <input id="newsletter-email" name="email" type="email" required placeholder={t("emailPlaceholder")} aria-label={t("email")}
            autoComplete="email" dir="ltr" disabled={newsletterState === "submitting"} />
          <label className="newsletter-consent"><input name="consent" type="checkbox" required disabled={newsletterState === "submitting"} />{t("newsletterConsent")}</label>
          <button className="button-outline" type="submit" disabled={newsletterState === "submitting"}>{t(newsletterState === "submitting" ? "subscribing" : "subscribe")}</button>
          <p role="status" aria-live="polite">{newsletterState === "success" ? t("newsletterThanks") : newsletterError}</p>
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
        {cartError && <div className="form-error" role="alert"><p>{cartError}</p><button type="button" className="text-link" disabled={cartPending > 0} onClick={() => void retryCart()}>{t("retry")}</button></div>}
        {placed ? <div className="cart-empty">
          <h3>{t("onWay")}</h3><p>{t("orderPlaced")}</p>
          <button type="button" className="button" onClick={() => dialog.current?.close()}>{t("continueExploring")}</button>
        </div> : checkout ? <form className="checkout-form" onSubmit={placeOrder}>
          <p>{t("checkoutIntro")}</p>
          {!isLoaded ? <p role="status">{t("accountLoading")}</p> : !isSignedIn ? <div className="checkout-signin">
            <p>{t("checkoutSignIn")}</p>
            <Link className="button" href={`/sign-in?redirect_url=${encodeURIComponent(pathname || "/")}`}>{t("signIn")}</Link>
          </div> : <>
            <label>{t("name")}<input required value={shipping.name} maxLength={100} autoComplete="name" onChange={event => setShipping({ ...shipping, name: event.target.value })} /></label>
            <label>{t("email")}<input type="email" required value={shipping.email} maxLength={254} dir="ltr" autoComplete="email" onChange={event => setShipping({ ...shipping, email: event.target.value })} /></label>
            <label>{t("address")}<input required value={shipping.address} maxLength={500} autoComplete="street-address" onChange={event => setShipping({ ...shipping, address: event.target.value })} /></label>
            <div className="cart-total"><span>{t("total")}</span><strong><bdi>{money(totalCents / 100)}</bdi></strong></div>
            <p className="muted">{t("shipping")}</p>
            {checkoutError && <p className="form-error" role="alert">{checkoutError}</p>}
            <button className="button" type="submit" disabled={checkoutBusy || busy}>{t(checkoutBusy ? "placingOrder" : "placeOrder")}</button>
          </>}
          <button type="button" className="text-link" onClick={() => { setCheckout(false); setCheckoutError(""); }}>{t("backToBag")}</button>
        </form> : count ? <>
          {busy && <p role="status">{t("bagSyncing")}</p>}
          <div>{products.filter(item => cart[item.id]).map(item => {
            const p = product(item);
            return <article className="cart-item" key={p.id}>
              <img src={photo(p.image)} alt={p.name} width="100" height="100" />
              <div><h3>{p.name}</h3><p>{p.size} · <bdi>{money(p.price)}</bdi></p>
                <div className="quantity-controls">
                  <button type="button" aria-label={t("decrease", { name: p.name })} disabled={busy} onClick={() => update(p.id, cart[p.id] - 1)}>−</button>
                  <span>{number(cart[p.id])}</span>
                  <button type="button" aria-label={t("increase", { name: p.name })} disabled={busy || cart[p.id] >= 20} onClick={() => update(p.id, cart[p.id] + 1)}>+</button>
                  <button type="button" className="remove-button" disabled={busy} onClick={() => update(p.id, 0)}>{t("remove")}</button>
                </div>
              </div>
            </article>;
          })}</div>
          <div className="cart-summary">
            <div className="cart-total"><span>{t("subtotal")}</span><strong><bdi>{money(totalCents / 100)}</bdi></strong></div>
            <p>{t("demoOnly")}</p>
            <button type="button" className="button" disabled={busy} onClick={() => setCheckout(true)}>{t("continueCheckout")}</button>
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