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