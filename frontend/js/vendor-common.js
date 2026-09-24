const AUTH_API_BASE = "http://127.0.0.1:8000/api";

function decodeToken() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

async function initVendorPage() {
  const payload = decodeToken();

  if (!payload) {
    window.location.href = "../login.html";
    return;
  }
  if (payload.role !== "VENDOR") {
    window.location.href = "../index.html";
    return;
  }

  const result = await apiRequest("/auth/profile/", "GET", null, true);

  if (!result.ok) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "../login.html";
    return;
  }

  const fullName = `${result.data.first_name} ${result.data.last_name}`.trim();
  const initial = result.data.first_name.charAt(0).toUpperCase();

  document.querySelectorAll(".js-vendor-name").forEach(el => el.textContent = fullName);
  document.querySelectorAll(".js-vendor-avatar").forEach(el => el.textContent = initial);
}

function vendorLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "../login.html";
}

initVendorPage();