import { Suspense } from "react";
import { AuthScreen } from "@/components/auth-screen";

export default function Page() {
  return (
    <Suspense fallback={<main className="section" aria-busy="true" />}>
      <AuthScreen mode="sign-up" />
    </Suspense>
  );
}
