const API_URL = "http://localhost:3000/api";

export async function getConcurrenciaActividades() {
  const res = await fetch(`${API_URL}/estadisticas/concurrencia`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Importante para que viaje el token/cookie del Administrador
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}