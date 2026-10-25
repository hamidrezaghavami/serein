"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useLanguage } from "./language-provider";

export function AuthControls() {
  const { isLoaded, isSignedIn } = useAuth();
  const { t } = useLanguage();
  const label = isLoaded && isSignedIn ? t("myAccount") : t("signIn");
  return <Link href="/account" prefetch={false} className="account-link" aria-label={label} title={label}>
    <svg width="19" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M4.5 21v-2.5a7.5 7.5 0 0 1 15 0V21" stroke="currentColor" strokeWidth="1.25" />
    </svg>
    <span className="account-link-label">{label}</span>
    {isLoaded && isSignedIn && <span className="account-status-dot" aria-hidden="true" />}
  </Link>;
}
