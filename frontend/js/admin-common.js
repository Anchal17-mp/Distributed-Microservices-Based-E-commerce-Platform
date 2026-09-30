function decodeTokenAdmin() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function initAdminPage() {
  const payload = decodeTokenAdmin();
  if (!payload) {
    window.location.href = "../login.html";
    return;
  }
  if (payload.role !== "ADMIN") {
    window.location.href = "../index.html";
    return;
  }
  document.querySelectorAll(".js-admin-email").forEach(el => el.textContent = payload.email);
}

function adminLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "../login.html";
}

initAdminPage();