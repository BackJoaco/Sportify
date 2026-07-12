const API_URL = "http://localhost:3000/api"; 

export async function getMisCreditos() {
  const res = await fetch(`${API_URL}/creditos/historial`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Fundamental para que envíe la cookie/token del usuario
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}