import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/language-provider";
import { AccountPanel } from "@/components/account-panel";

const fixture = vi.hoisted(() => ({
  auth: { isLoaded: true, isSignedIn: true, userId: "user_alice" as string | null },
  getToken: vi.fn(), signOut: vi.fn(), openUserProfile: vi.fn(),
}));
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ ...fixture.auth, getToken: fixture.getToken }),
  useUser: () => ({ user: { primaryEmailAddress: { emailAddress: "alice@example.com" } } }),
  useClerk: () => ({ signOut: fixture.signOut, openUserProfile: fixture.openUserProfile }),
}));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: { href: string; children: ReactNode }) => <a href={href} {...props}>{children}</a> }));
const profile = { id: "user_alice", displayName: "Alice", phone: null, address: null };
const fetcher = vi.fn();
const response = (data: unknown, status = 200) => new Response(JSON.stringify({ data }), { status });
const page = (locale: "en" | "fa" = "en") => <LanguageProvider initialLocale={locale}><AccountPanel /></LanguageProvider>;

beforeEach(() => {
  fixture.auth = { isLoaded: true, isSignedIn: true, userId: "user_alice" };
  fixture.getToken.mockResolvedValue("alice-session-token"); fixture.signOut.mockResolvedValue(undefined);
  fetcher.mockImplementation((url: string) => Promise.resolve(url.includes("/orders") ? response([]) : response(profile)));
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:4000/api/v1"); vi.stubGlobal("fetch", fetcher);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it("waits for Clerk before requesting private data", () => {
  fixture.auth.isLoaded = false; render(page());
  expect(screen.getByRole("status")).toHaveTextContent("Preparing your account");
  expect(fetcher).not.toHaveBeenCalled();
});
it("shows a sign-in action to a guest without fetching account data", () => {
  fixture.auth.isSignedIn = false; fixture.auth.userId = null; render(page());
  expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
  expect(fetcher).not.toHaveBeenCalled();
});
it("loads the real account and order history using a bearer token", async () => {
  render(page());
  expect(await screen.findByDisplayValue("Alice")).toBeInTheDocument();
  expect(screen.getByText("Your saved orders will appear here.")).toBeInTheDocument();
  expect(fetcher).toHaveBeenCalledWith("http://localhost:4000/api/v1/account", expect.objectContaining({ headers: { Authorization: "Bearer alice-session-token" } }));
});
it("saves the profile to the API without sending a client-controlled account id", async () => {
  render(page()); const name = await screen.findByLabelText("Display name"); const user = userEvent.setup();
  await user.clear(name); await user.type(name, "Alice Updated");
  await user.click(screen.getByRole("button", { name: "Save details" }));
  await screen.findByText("Your details have been saved.");
  const call = fetcher.mock.calls.find(([, options]) => options.method === "PATCH");
  expect(JSON.parse(call?.[1].body)).toEqual({ displayName: "Alice Updated", phone: null, address: null });
});
it("shows a retry action on connection failure and recovers", async () => {
  fetcher.mockRejectedValue(new Error("offline")); render(page());
  expect(await screen.findByRole("alert")).toHaveTextContent("We could not reach your account");
  fetcher.mockImplementation((url: string) => Promise.resolve(url.includes("/orders") ? response([]) : response(profile)));
  await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByDisplayValue("Alice")).toBeInTheDocument();
});
it("clears private profile content when the session signs out", async () => {
  const view = render(page()); await screen.findByDisplayValue("Alice");
  fixture.auth.isSignedIn = false; fixture.auth.userId = null; view.rerender(page());
  expect(screen.queryByDisplayValue("Alice")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
});
it("shows translated profile controls for the Persian interface", async () => {
  render(page("fa"));
  expect(await screen.findByLabelText("نام نمایشی")).toHaveValue("Alice");
  expect(screen.getByRole("button", { name: "ذخیرهٔ اطلاعات" })).toBeInTheDocument();
});
it("signs out through Clerk and returns to the storefront", async () => {
  render(page()); await screen.findByDisplayValue("Alice");
  await userEvent.setup().click(screen.getByRole("button", { name: "Sign out" }));
  await waitFor(() => expect(fixture.signOut).toHaveBeenCalledWith({ redirectUrl: "/" }));
});