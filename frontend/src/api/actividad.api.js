const API_URL = "http://localhost:3000/api";

export async function getActividades() {
    const res = await fetch(`${API_URL}/actividad/listar`, {
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
        throw data;
    }

    return data;
}
export async function createActividad(datos) {
    const res = await fetch(`${API_URL}/actividad/crear`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(datos),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Error del servidor: ${res.status}` }));
        throw errorData;
    }

    return await res.json();
}

export async function deleteActividad(id) {
  const res = await fetch(`${API_URL}/actividad/eliminar/${id}`, {
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