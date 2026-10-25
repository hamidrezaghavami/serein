import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api";
const fetcher = vi.fn();
beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:4000/api/v1"); vi.stubGlobal("fetch", fetcher); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it("sends the current session bearer token and does not cache profile data", async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ data: { id: "user_a" } }), { status: 200 }));
  await expect(apiRequest("/account", { token: "session-token" })).resolves.toEqual({ data: { id: "user_a" } });
  expect(fetcher).toHaveBeenCalledWith("http://localhost:4000/api/v1/account", expect.objectContaining({ cache: "no-store", headers: { Authorization: "Bearer session-token" } }));
});
it("does not make an anonymous protected request", async () => {
  await expect(apiRequest("/account", { token: "" })).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
  expect(fetcher).not.toHaveBeenCalled();
});
it("keeps the server's error code for a failed session", async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ error: { code: "UNAUTHENTICATED" } }), { status: 401 }));
  await expect(apiRequest("/account", { token: "expired" })).rejects.toMatchObject({ code: "UNAUTHENTICATED", status: 401 });
});
it("reports an invalid success payload rather than accepting an HTML error page", async () => {
  fetcher.mockResolvedValue(new Response("<html>error</html>", { status: 200 }));
  await expect(apiRequest("/account", { token: "token" })).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
});
it("sends only the requested profile fields on a JSON PATCH", async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ data: {} }), { status: 200 }));
  await apiRequest("/account", { token: "token", method: "PATCH", body: { displayName: "Alice" } });
  expect(fetcher).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: "PATCH", body: '{"displayName":"Alice"}', headers: { Authorization: "Bearer token", "Content-Type": "application/json" } }));
});
it("turns a stalled network request into a recoverable error", async () => {
  vi.useFakeTimers();
  fetcher.mockImplementation((_url, options: RequestInit) => new Promise((_resolve, reject) => {
    options.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
  }));
  const assertion = expect(apiRequest("/account", { token: "token" })).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  await vi.advanceTimersByTimeAsync(15000); await assertion;
});
