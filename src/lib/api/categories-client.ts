import { getAccessToken } from "./auth-client";

export type ApiCategory = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  isFavorite?: boolean;
};

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  return base.replace(/\/$/, "");
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getRegisteredCategories(): Promise<ApiCategory[]> {
  const res = await fetch(`${apiBase()}/registered/categories`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  return (await res.json()) as ApiCategory[];
}

export async function getFavoriteCategorySlugs(): Promise<string[]> {
  const res = await fetch(`${apiBase()}/registered/favorite-categories`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  return (await res.json()) as string[];
}

export async function saveFavoriteCategorySlugs(categorySlugs: string[]) {
  const res = await fetch(`${apiBase()}/registered/favorite-categories`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ categorySlugs }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Failed";
    return { ok: false as const, message };
  }
  const data = (await res.json()) as { favoriteCategorySlugs: string[] };
  return { ok: true as const, data };
}
