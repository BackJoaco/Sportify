const API_URL = "http://localhost:3000/api/demo";

export async function simularDias1a10() {
  const res = await fetch(`${API_URL}/dias-1-10`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function simularDia11() {
  const res = await fetch(`${API_URL}/dia-11`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function forzarCancelacion(turnoId) {
  const res = await fetch(`${API_URL}/forzar-cancelacion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turno_id: turnoId }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function simularExpiracion() {
  const res = await fetch(`${API_URL}/simular-expiracion`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function simularAltaDemanda(turnoId) {
  const res = await fetch(`${API_URL}/alta-demanda`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turno_id: turnoId }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
