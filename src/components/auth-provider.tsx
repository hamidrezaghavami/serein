"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { enUS, faIR } from "@clerk/localizations";
import { useLanguage } from "./language-provider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // Fail clearly rather than provisioning a different, accountless Clerk application.
  if (!publishableKey) throw new Error("Clerk is not configured. Run node scripts/configure-auth.mjs from the project root.");
  return <ClerkProvider
    publishableKey={publishableKey}
    localization={locale === "fa" ? faIR : enUS}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    signInFallbackRedirectUrl="/account"
    signUpFallbackRedirectUrl="/account"
    afterSignOutUrl="/"
    appearance={{ variables: {
      colorPrimary: "#292d29", colorBackground: "#fcf9f2", colorForeground: "#292d29",
      borderRadius: "3px", fontFamily: locale === "fa" ? "Vazirmatn, Tahoma, sans-serif" : "Plus Jakarta Sans, Arial, sans-serif",
    }, elements: { cardBox: { boxShadow: "none", maxWidth: "100%" }, rootBox: { maxWidth: "100%" } } }}
  >{children}</ClerkProvider>;
}
