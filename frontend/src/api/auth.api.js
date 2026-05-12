const API_URL = "http://localhost:3000/api";

export async function register(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  console.log("${API_URL}/auth/register", data, res);
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw await res.json();
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw await res.json();
  return res.json();
}