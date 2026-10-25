import { EventEmitter } from "node:events";
import type { Express, Request, Response } from "express";
import { createMocks } from "node-mocks-http";

// Exercise Express routing/middleware with parsed requests, without a listening TCP port.
export function request(app: Express, method: string, url: string, options: { body?: Record<string, unknown>; token?: string; headers?: Record<string, string> } = {}) {
  const { req, res } = createMocks<Request, Response>({
    method: method as "GET", url, body: options.body,
    headers: { ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}), ...options.headers },
    ip: "127.0.0.1",
  }, { eventEmitter: EventEmitter });
  return new Promise<{ status: number; body: any; headers: ReturnType<typeof res._getHeaders> }>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timed out: ${method} ${url}`)), 10000);
    res.once("end", () => {
      clearTimeout(timer);
      const text = res._getData();
      resolve({ status: res.statusCode, body: typeof text === "string" && text ? JSON.parse(text) : text, headers: res._getHeaders() });
    });
    app(req, res);
  });
}