const API_URL = "http://localhost:3000/api";

export async function getMisReservas() {
  const res = await fetch(`${API_URL}/reserva/mis-reservas`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function crearReserva(datos) {
  const res = await fetch(`${API_URL}/reserva/crear`, {
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

export async function cancelarReserva(id) {
  const res = await fetch(`${API_URL}/reserva/${id}/cancelar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}