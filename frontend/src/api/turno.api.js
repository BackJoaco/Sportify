const API_URL = "http://localhost:3000/api";

export async function createTurno(datos) {
  const res = await fetch(`${API_URL}/turno/crear`, {
    method: "POST",
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

export async function getTurnos() {
  const res = await fetch(`${API_URL}/turno/listar`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}