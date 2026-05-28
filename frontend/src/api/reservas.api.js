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
