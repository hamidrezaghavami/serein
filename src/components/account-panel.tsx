"use client";

import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-provider";
import { apiRequest, ApiError, type AccountProfile, type AccountOrder } from "@/lib/api";

export function AccountPanel() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { t } = useLanguage();
  if (!isLoaded) return <main className="section account-page" aria-busy="true"><p role="status">{t("accountLoading")}</p></main>;
  if (!isSignedIn || !userId) return <main className="section account-page">
    <h1>{t("myAccount")}</h1><p className="muted">{t("signInAccount")}</p>
    <Link className="button" href="/sign-in">{t("signIn")}</Link>
  </main>;
  // A different session gets a new component, so another user's profile never flashes.
  return <AccountDetails key={userId} owner={userId} />;
}

function AccountDetails({ owner }: { owner: string }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { t, locale, money, number } = useLanguage();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [fields, setFields] = useState({ displayName: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [retry, setRetry] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const mounted = useRef(true);
  const hydrated = useRef(false);
  const saveRequest = useRef<AbortController | null>(null);

  const errorMessage = useCallback((failure: unknown) => {
    if (failure instanceof ApiError && failure.status === 401) return t("accountSessionError");
    if (failure instanceof ApiError && failure.code === "INVALID_INPUT") return t("accountInputError");
    return t("accountConnectionError");
  }, [t]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; saveRequest.current?.abort(); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError(""); setSaved(false);
    void (async () => {
      try {
        const token = await getToken();
        if (!active) return;
        if (!token) throw new ApiError("UNAUTHENTICATED", 401);
        const [account, history] = await Promise.all([
          apiRequest<{ data: AccountProfile }>("/account", { token, signal: controller.signal }),
          apiRequest<{ data: AccountOrder[] }>(`/orders?locale=${locale}&limit=10`, { token, signal: controller.signal }),
        ]);
        if (!active) return;
        if (!account.data || account.data.id !== owner || !Array.isArray(history.data)) throw new ApiError("INVALID_RESPONSE");
        setProfile(account.data); setOrders(history.data);
        if (!hydrated.current) {
          setFields({ displayName: account.data.displayName || "", phone: account.data.phone || "", address: account.data.address || "" });
          hydrated.current = true;
        }
      } catch (failure) {
        if (active) { setProfile(null); setOrders([]); setError(errorMessage(failure)); }
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; controller.abort(); };
    // Translation functions are recreated by the language context. The locale is the dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, getToken, locale, retry]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving) return;
    const controller = new AbortController(); saveRequest.current = controller;
    setSaving(true); setSaved(false); setError("");
    try {
      const token = await getToken();
      if (!mounted.current) return;
      if (!token) throw new ApiError("UNAUTHENTICATED", 401);
      const result = await apiRequest<{ data: AccountProfile }>("/account", {
        token, method: "PATCH", signal: controller.signal,
        body: { displayName: fields.displayName.trim() || null, phone: fields.phone.trim() || null, address: fields.address.trim() || null },
      });
      if (mounted.current) { setProfile(result.data); setSaved(true); }
    } catch (failure) { if (mounted.current) setError(errorMessage(failure)); }
    finally { if (mounted.current) setSaving(false); }
  }

  const change = (key: keyof typeof fields, value: string) => { setSaved(false); setFields(previous => ({ ...previous, [key]: value })); };
  return <main className="section account-page">
    <div className="account-heading">
      <div><p className="eyebrow">SEREIN</p><h1>{t("myAccount")}</h1><p className="muted">{t("accountIntroduction")}</p></div>
      <button type="button" className="button-outline" disabled={leaving} onClick={() => {
        setLeaving(true); void signOut({ redirectUrl: "/" }).catch(() => { setLeaving(false); setError(t("accountConnectionError")); });
      }}>{t("signOut")}</button>
    </div>
    {loading ? <p role="status" aria-live="polite">{t("accountLoading")}</p> : <>
      {error && <div className="account-error"><p role="alert">{error}</p>{!profile && <button className="button-outline" onClick={() => setRetry(value => value + 1)}>{t("retry")}</button>}</div>}
      {profile && <div className="account-columns">
        <section className="account-card" aria-labelledby="profile-title">
          <h2 id="profile-title">{t("profileDetails")}</h2>
          {user?.primaryEmailAddress?.emailAddress && <p className="muted" dir="ltr">{user.primaryEmailAddress.emailAddress}</p>}
          <form className="profile-form" onSubmit={save}>
            <fieldset disabled={saving}>
              <label>{t("profileName")}<input autoComplete="name" maxLength={100} value={fields.displayName} onChange={event => change("displayName", event.target.value)} /></label>
              <label>{t("profilePhone")}<input type="tel" autoComplete="tel" minLength={5} maxLength={30} dir="ltr" value={fields.phone} onChange={event => change("phone", event.target.value)} /></label>
              <label>{t("profileAddress")}<textarea autoComplete="street-address" minLength={5} maxLength={500} rows={3} value={fields.address} onChange={event => change("address", event.target.value)} /></label>
              <button className="button" type="submit">{t(saving ? "saving" : "saveProfile")}</button>
            </fieldset>
            <p role="status">{saved ? t("profileSaved") : ""}</p>
          </form>
          <button className="text-link" type="button" onClick={() => openUserProfile()}>{t("manageSignIn")}</button>
        </section>
        <section className="account-card" aria-labelledby="orders-title">
          <h2 id="orders-title">{t("yourOrders")}</h2>
          <p className="muted">{t("accountDemoNote")}</p>
          {orders.length === 0 ? <p className="empty-orders">{t("noOrders")}</p> : <ol className="account-orders">
            {orders.map(order => <li key={order.id}>
              <div className="account-order-heading"><span>{new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", { dateStyle: "medium" }).format(new Date(order.createdAt))}</span><bdi>{money(order.totalCents / 100)}</bdi></div>
              <p className="eyebrow">{t("demoConfirmed")}</p>
              <ul>{order.items.map(item => <li key={item.productId}>{item.name} × {number(item.quantity)}</li>)}</ul>
            </li>)}
          </ol>}
          <Link className="text-link" href="/shop">{t("continueShopping")}</Link>
        </section>
      </div>}
    </>}
  </main>;
}