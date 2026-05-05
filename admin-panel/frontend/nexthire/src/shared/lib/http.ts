import { env } from "@/shared/config/env";

export type ApiErrorShape =
  | { success: false; message?: string; code?: string }
  | { message?: string; error?: string };

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.json !== undefined) headers.set("Content-Type", "application/json");

  const token = localStorage.getItem("accessToken");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg =
      (data as ApiErrorShape | null)?.message ??
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

