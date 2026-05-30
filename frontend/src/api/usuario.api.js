const API_URL = "http://localhost:3000/api";

export async function getProfile() {
  const res = await fetch(`${API_URL}/usuario/perfil`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function updateProfile(datos) {
  const res = await fetch(`${API_URL}/usuario/perfil`, {
    method: "PUT",
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

export async function createEmployee(datos) {
  const res = await fetch(`${API_URL}/usuario/empleados`, {
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

export async function deleteEmployee(id) {
  const res = await fetch(`${API_URL}/usuario/empleados/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function getUsuarios() {
  const res = await fetch(`${API_URL}/usuario`, {
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) {
    throw data;
  }
  return data;
}

export async function setPassword(token, password) {
  const res = await fetch(`${API_URL}/usuario/empleados/set-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}