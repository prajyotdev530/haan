async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail))
        message = data.detail.map((d) => `${d.loc.slice(1).join(".")}: ${d.msg}`).join("; ");
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  emi: (amount, tenure) => request(`/emi?amount=${amount}&tenure=${tenure}`),
  stats: () => request("/stats"),
  users: () => request("/users"),
  user: (id) => request(`/users/${id}`),
  createUser: (body) => request("/users", { method: "POST", body }),
  updateUser: (id, body) => request(`/users/${id}`, { method: "PUT", body }),
  applications: () => request("/applications"),
  application: (id) => request(`/applications/${id}`),
  createApplication: (body) => request("/applications", { method: "POST", body }),
  assess: (id) => request(`/applications/${id}/assess`, { method: "POST" }),
};
