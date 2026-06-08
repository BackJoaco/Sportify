const API_URL = "http://localhost:3000/api";

export async function pagarSenaReserva(datos) {
  const res = await fetch(`${API_URL}/pago/sena-reserva`, {
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

export async function registrarSenaPresencial(datos) {
  const res = await fetch(`${API_URL}/pago/sena-presencial`, {
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
