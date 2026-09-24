const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  window.location.href = "login.html";
});