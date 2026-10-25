export class ApiError extends Error {
  constructor(public code: string, public status = 0) { super(code); this.name = "ApiError"; }
}

type ApiOptions = {
  token?: string;
  public?: boolean;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: ApiOptions): Promise<T> {
  if (!options.public && !options.token) throw new ApiError("UNAUTHENTICATED", 401);
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new ApiError("API_NOT_CONFIGURED");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
      method: options.method || "GET", cache: "no-store", signal: controller.signal,
      headers: {
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
    const result = await response.json().catch(() => { throw new ApiError("INVALID_RESPONSE", response.status); });
    if (!response.ok) throw new ApiError(result?.error?.code || "REQUEST_FAILED", response.status);
    if (!result || typeof result !== "object" || !("data" in result)) throw new ApiError("INVALID_RESPONSE", response.status);
    return result as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (options.signal?.aborted) throw error;
    throw new ApiError("NETWORK_ERROR");
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
}

export type AccountProfile = {
  id: string; displayName: string | null; phone: string | null; address: string | null;
  createdAt: string; updatedAt: string;
};
export type AccountOrder = {
  id: string; status: string; demo: boolean; currency: string; totalCents: number; createdAt: string;
  items: { productId: string; name: string; image: string; quantity: number; unitPriceCents: number; lineTotalCents: number }[];
};

export type ApiCart = {
  items: { product: { id: string }; quantity: number; available?: boolean; lineTotalCents: number }[];
  itemCount: number;
  subtotalCents: number;
  subtotal: number;
  currency: string;
};

export type DemoOrder = AccountOrder & {
  shipping: { name: string; email: string; address: string };
};