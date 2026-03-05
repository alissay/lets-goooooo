const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  tasks: {
    list: (userId: string, domain?: string) =>
      request(`/tasks?userId=${userId}${domain ? `&domain=${domain}` : ""}`),
    current: (userId: string) => request(`/tasks/current?userId=${userId}`),
    create: (data: Record<string, unknown>) =>
      request("/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    complete: (id: string) =>
      request(`/tasks/${id}/complete`, { method: "POST" }),
    defer: (id: string, deferUntil?: string) =>
      request(`/tasks/${id}/defer`, { method: "POST", body: JSON.stringify({ deferUntil }) }),
    nowMode: (id: string, durationMinutes: number) =>
      request(`/tasks/${id}/now-mode`, { method: "POST", body: JSON.stringify({ durationMinutes }) }),
    decompose: (id: string) =>
      request<{ steps: string[] }>(`/tasks/${id}/decompose`, { method: "POST" }),
    delete: (id: string) =>
      request(`/tasks/${id}`, { method: "DELETE" }),
  },
  feelings: {
    log: (data: Record<string, unknown>) =>
      request("/feelings", { method: "POST", body: JSON.stringify(data) }),
    list: (userId: string) => request(`/feelings?userId=${userId}`),
  },
  wins: {
    list: (userId: string, domain?: string) =>
      request(`/wins?userId=${userId}${domain ? `&domain=${domain}` : ""}`),
    summary: (userId: string) => request(`/wins/summary?userId=${userId}`),
  },
  goals: {
    list: (userId: string, domain?: string) =>
      request(`/goals?userId=${userId}${domain ? `&domain=${domain}` : ""}`),
    create: (data: Record<string, unknown>) =>
      request("/goals", { method: "POST", body: JSON.stringify(data) }),
  },
};
