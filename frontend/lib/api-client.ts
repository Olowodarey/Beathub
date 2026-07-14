"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";

const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function doFetch<T>(
  path: string,
  init: RequestInit,
  token: string | null,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {}
    const msg =
      (body as { message?: string } | undefined)?.message ?? res.statusText;
    throw new ApiError(res.status, msg, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function publicGet<T>(path: string): Promise<T> {
  return doFetch<T>(path, { method: "GET" }, null);
}

export interface ApiClient {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  patch: <T>(path: string, body?: unknown) => Promise<T>;
  delete: <T = void>(path: string) => Promise<T>;
}

export function useApiClient(): ApiClient {
  const { getToken } = useAuth();

  const request = useCallback(
    async <T>(path: string, init: RequestInit = {}): Promise<T> => {
      const token = await getToken();
      return doFetch<T>(path, init, token);
    },
    [getToken],
  );

  return useMemo<ApiClient>(
    () => ({
      get: (path) => request(path),
      post: (path, body) =>
        request(path, {
          method: "POST",
          body: body === undefined ? undefined : JSON.stringify(body),
        }),
      patch: (path, body) =>
        request(path, {
          method: "PATCH",
          body: body === undefined ? undefined : JSON.stringify(body),
        }),
      delete: (path) => request(path, { method: "DELETE" }),
    }),
    [request],
  );
}
