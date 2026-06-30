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

export async function deleteTurno(id) {
  const res = await fetch(`${API_URL}/turno/${id}`, {
    method: "DELETE",
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

export async function getTurnoById(id) {
  const res = await fetch(`${API_URL}/turno/${id}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function getReservasCount(id) {
  const res = await fetch(`${API_URL}/turno/${id}/reservas/count`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function updateTurno(id, datosNuevos) {
  const res = await fetch(`${API_URL}/turno/modificar/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(datosNuevos),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function getOcupacionTurno(id, fecha) {
  const params = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
  const res = await fetch(`${API_URL}/turno/${id}/ocupacion${params}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function altaAbonadoTurno(id, usuarioId = null) {
  const res = await fetch(`${API_URL}/turno/${id}/abonados`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(usuarioId ? { usuario_id: usuarioId } : {}),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function bajaAbonadoTurno(id, usuarioId = null) {
  const res = await fetch(`${API_URL}/turno/${id}/abonados/baja`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(usuarioId ? { usuario_id: usuarioId } : {}),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}
