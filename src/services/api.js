const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(method, url, data) {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
    },
    body: data ? JSON.stringify(data) : undefined
  });

  if (!res.ok) {
    let msg = "Request failed";
    try {
      const json = await res.json();
      msg = json.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.status === 204 ? null : res.json();
}

export const apiGet = (url) => request("GET", url);
export const apiPost = (url, data) => request("POST", url, data);
export const apiPatch = (url, data) => request("PATCH", url, data);
export const apiDelete = (url) => request("DELETE", url);