const API_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:4000";

export type ApiError = { error: string };

export function getToken() {
  return localStorage.getItem("token") ?? "";
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init.headers);
  if (!headers.has("content-type") && !(init.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }

  const token = getToken();
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = (data as any)?.error ?? res.statusText;
    throw new Error(msg);
  }

  return data as T;
}

export async function uploadFile(kind: "image" | "digital", file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ imageUrl?: string; digitalFilePath?: string }>(`/api/uploads/${kind}`, {
    method: "POST",
    body: form,
    headers: {},
  });
}
