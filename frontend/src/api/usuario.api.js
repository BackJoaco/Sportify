const API_URL = "http://localhost:3000/api";

export async function getProfile() {
  const res = await fetch(`${API_URL}/usuario/perfil`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function updateProfile(datos) {
  const res = await fetch(`${API_URL}/usuario/perfil`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(datos),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}