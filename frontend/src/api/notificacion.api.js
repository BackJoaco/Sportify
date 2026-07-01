const API_URL = "http://localhost:3000/api";

export async function getMisNotificaciones() {
  const res = await fetch(`${API_URL}/notificacion/mis-notificaciones`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function marcarComoLeida(id) {
  const res = await fetch(`${API_URL}/notificacion/${id}/leida`, {
    method: "PATCH",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function marcarTodasComoLeidas() {
  const res = await fetch(`${API_URL}/notificacion/leidas/todas`, {
    method: "PATCH",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}
