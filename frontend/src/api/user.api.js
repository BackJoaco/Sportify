const API_URL = "http://localhost:3000/api";

export async function getProfile() {
  const res = await fetch(`${API_URL}/user/perfil`, {
    credentials: "include",
  });

  const data = await res.json();

  console.log("getProfile data:", data);

  if (!res.ok) {
    throw data;
  }

  return data;
}