const API_URL = "http://localhost:3000/api/demo";


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

export async function generarCreditoAVencer() {
  const res = await fetch(`${API_URL}/generar-credito-a-vencer`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function expirarCreditoDemo() {
  const res = await fetch(`${API_URL}/expirar-credito`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
