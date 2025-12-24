const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiGet(path, token = null) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { headers });

  if (!res.ok) {
    throw new Error("Failed to fetch");
  }

  return res.json();
}
