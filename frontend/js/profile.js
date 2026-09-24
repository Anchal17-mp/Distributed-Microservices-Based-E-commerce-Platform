const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");

// Redirect to login if no token exists at all
if (!localStorage.getItem("access_token")) {
  window.location.href = "../login.html";
}

async function loadProfile() {
  const result = await apiRequest("/auth/profile/", "GET", null, true);

  if (result.ok) {
    document.getElementById("first_name").value = result.data.first_name;
    document.getElementById("last_name").value = result.data.last_name;
    document.getElementById("email").value = result.data.email;
    document.getElementById("phone").value = result.data.phone;
    document.getElementById("gender").value = result.data.gender;
    document.getElementById("dob").value = result.data.dob || "";
  } else if (result.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "../login.html";
  } else {
    profileMessage.textContent = "Failed to load profile.";
    profileMessage.className = "error";
  }
}

profileForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  profileMessage.textContent = "";
  profileMessage.className = "";

  const payload = {
    first_name: document.getElementById("first_name").value,
    last_name: document.getElementById("last_name").value,
    phone: document.getElementById("phone").value,
    gender: document.getElementById("gender").value,
    dob: document.getElementById("dob").value || null,
  };

  const submitButton = profileForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  const result = await apiRequest("/auth/profile/", "PATCH", payload, true);

  submitButton.disabled = false;
  submitButton.textContent = "Save Changes";

  if (result.ok) {
    profileMessage.textContent = "Profile updated successfully.";
    profileMessage.className = "success";
  } else if (result.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "../login.html";
  } else {
    profileMessage.textContent = "Failed to update profile. Please check your input.";
    profileMessage.className = "error";
  }
});

loadProfile();