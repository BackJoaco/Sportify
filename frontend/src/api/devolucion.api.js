const API_URL = "http://localhost:3000/api";

export async function getDevolucionesPendientes() {
  const res = await fetch(`${API_URL}/devoluciones/pendientes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Crucial para que viajen las cookies de sesión del staff
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}