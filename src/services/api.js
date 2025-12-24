const API_BASE = "http://localhost:3000/api";

export async function fetchWalkers() {
  const res = await fetch(`${API_BASE}/walkers`);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
}
