import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAccount = createRouteMatcher(["/account(.*)"]);
export default clerkMiddleware(async (auth, request) => {
  if (isAccount(request)) await auth.protect();
}, {
  authorizedParties: (process.env.CLERK_AUTHORIZED_PARTIES || "http://localhost:3000,http://localhost:3001")
    .split(",").map(origin => origin.trim()).filter(Boolean),
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
