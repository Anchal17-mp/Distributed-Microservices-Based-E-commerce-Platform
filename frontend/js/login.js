const form = document.getElementById("loginForm");
const formMessage = document.getElementById("formMessage");

function clearErrors() {
  document.getElementById("emailError").textContent = "";
  document.getElementById("passwordError").textContent = "";
  document.getElementById("email").classList.remove("input-error");
  document.getElementById("password").classList.remove("input-error");
  formMessage.textContent = "";
  formMessage.className = "";
}

function validateForm(payload) {
  let isValid = true;

  if (!payload.email.trim()) {
    document.getElementById("emailError").textContent = "Email is required.";
    document.getElementById("email").classList.add("input-error");
    isValid = false;
  }
  if (!payload.password.trim()) {
    document.getElementById("passwordError").textContent = "Password is required.";
    document.getElementById("password").classList.add("input-error");
    isValid = false;
  }

  return isValid;
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  clearErrors();

  const payload = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  if (!validateForm(payload)) {
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";

  const result = await apiRequest("/auth/login/", "POST", payload);

  submitButton.disabled = false;
  submitButton.textContent = "Login";

  if (result.ok) {
    localStorage.setItem("access_token", result.data.access);
    localStorage.setItem("refresh_token", result.data.refresh);

    formMessage.textContent = "Login successful! Redirecting...";
    formMessage.className = "success";
    const tokenPayload = JSON.parse(atob(result.data.access.split(".")[1]));
    const redirectUrl = tokenPayload.role === "VENDOR" ? "vendor/dashboard.html" : "customer/dashboard.html";


    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1000);
  } else {
    formMessage.textContent = result.data.detail || "Login failed. Please try again.";
    formMessage.className = "error";
  }
});