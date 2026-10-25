"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useLanguage } from "./language-provider";

export function AuthScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { t } = useLanguage();
  return <main className="section auth-screen">
    <div className="auth-introduction">
      <p className="eyebrow">SEREIN</p>
      <h1>{t(mode === "sign-in" ? "welcomeBack" : "joinSerein")}</h1>
      <p className="muted">{t("accountIntroduction")}</p>
    </div>
    <div className="auth-form-shell">
      {mode === "sign-in"
        ? <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/account" />
        : <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/account" />}
    </div>
  </main>;
}
