const API_URL = "http://localhost:3000/api";

export async function getMisPagos() {
  const res = await fetch(`${API_URL}/pago/mis-pagos`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

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

export async function obtenerMontoSenaReserva(datos) {
  const res = await fetch(`${API_URL}/pago/sena-reserva/monto`, {
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

export async function obtenerMontoSenaTurno(datos) {
  const res = await fetch(`${API_URL}/pago/sena-turno/monto`, {
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

export async function pagarSuscripcionMensual(datos) {
  const res = await fetch(`${API_URL}/pago/suscripcion-mensual`, {
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

export async function obtenerMontoSuscripcionMensual(datos) {
  const res = await fetch(`${API_URL}/pago/suscripcion-mensual/monto`, {
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

export async function getPagosPendientes() {
  const res = await fetch(`${API_URL}/pago/pendientes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Importante para que valide que sos Administrador
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}
export async function aplicarCreditoClase(datosPago) {
  const res = await fetch(`${API_URL}/pago/aplicar-credito`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // datosPago debe incluir: creditoId, reservaId, montoClase, tipoPago
    body: JSON.stringify(datosPago),
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function getMovimientos() {
  const res = await fetch(`${API_URL}/pago/movimientos`, { // Ajustá la ruta según tu backend
    method: "GET",
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