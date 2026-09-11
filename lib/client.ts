export async function api<T = unknown>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Ошибка ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const get = <T = unknown>(url: string) => api<T>(url);

export const post = <T = unknown>(url: string, body?: unknown) =>
  api<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export const patch = <T = unknown>(url: string, body?: unknown) =>
  api<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });

export const del = <T = unknown>(url: string, body?: unknown) =>
  api<T>(url, {
    method: "DELETE",
    body: body ? JSON.stringify(body) : undefined,
  });