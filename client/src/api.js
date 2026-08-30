const BASE = "/api";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  getState: () => request("/state"),
  login: (id, pin) =>
    request("/login", { method: "POST", body: JSON.stringify({ id, pin }) }),
  confirm: (group, id) =>
    request("/confirm", { method: "POST", body: JSON.stringify({ group, id }) }),
  advance: () => request("/advance", { method: "POST" }),
  start: () => request("/start", { method: "POST" }),
  stop: () => request("/stop", { method: "POST" }),
  reset: () => request("/reset", { method: "POST" }),
};
