const GATEWAY_BASE = "http://127.0.0.1:8080/api";
const API_BASE_URL = GATEWAY_BASE;

async function apiRequest(endpoint, method = "GET", body = null, useAuth = false) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (useAuth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const options = { method, headers };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return { ok: response.ok, status: response.status, data };
}

async function apiRequestFormData(endpoint, method, formData) {
  const headers = {};

  const token = localStorage.getItem("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}