const AUTH_API_BASE_C = GATEWAY_BASE;

function decodeTokenC() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

async function initCustomerPage() {
  const payload = decodeTokenC();

  if (!payload) {
    window.location.href = "../login.html";
    return;
  }
  if (payload.role !== "CUSTOMER") {
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

  document.querySelectorAll(".js-customer-name").forEach(el => el.textContent = fullName);
  document.querySelectorAll(".js-customer-avatar").forEach(el => el.textContent = initial);
  document.querySelectorAll(".js-customer-firstname").forEach(el => el.textContent = result.data.first_name);
}

function customerLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "../login.html";
}

initCustomerPage();