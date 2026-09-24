const form = document.getElementById("registerForm");
const formMessage = document.getElementById("formMessage");
const roleSelect = document.getElementById("role");
const businessNameGroup = document.getElementById("businessNameGroup");
const businessDescriptionGroup = document.getElementById("businessDescriptionGroup");

const fields = ["firstName", "lastName", "email", "password", "phone", "gender"];

function toggleVendorFields() {
  const isVendor = roleSelect.value === "VENDOR";
  businessNameGroup.style.display = isVendor ? "block" : "none";
  businessDescriptionGroup.style.display = isVendor ? "block" : "none";
}

roleSelect.addEventListener("change", toggleVendorFields);
toggleVendorFields(); // run once on page load in case of a pre-selected value

function clearErrors() {
  fields.forEach((field) => {
    document.getElementById(field + "Error").textContent = "";
    document.getElementById(field).classList.remove("input-error");
  });
  document.getElementById("businessNameError").textContent = "";
  document.getElementById("businessName").classList.remove("input-error");
  formMessage.textContent = "";
  formMessage.className = "";
}

function showFieldError(fieldId, message) {
  document.getElementById(fieldId + "Error").textContent = message;
  document.getElementById(fieldId).classList.add("input-error");
}

function validateForm(payload) {
  let isValid = true;

  if (!payload.first_name.trim()) {
    showFieldError("firstName", "First name is required.");
    isValid = false;
  }
  if (!payload.last_name.trim()) {
    showFieldError("lastName", "Last name is required.");
    isValid = false;
  }
  if (!payload.email.trim()) {
    showFieldError("email", "Email is required.");
    isValid = false;
  }
  if (payload.password.length < 8) {
    showFieldError("password", "Password must be at least 8 characters.");
    isValid = false;
  }
  if (!payload.phone.trim()) {
    showFieldError("phone", "Phone number is required.");
    isValid = false;
  }
  if (!payload.gender) {
    showFieldError("gender", "Please select a gender.");
    isValid = false;
  }
  if (payload.role === "VENDOR" && !payload.business_name.trim()) {
    showFieldError("businessName", "Business name is required for vendor accounts.");
    isValid = false;
  }

  return isValid;
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  clearErrors();

  const payload = {
    first_name: document.getElementById("firstName").value,
    last_name: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    phone: document.getElementById("phone").value,
    gender: document.getElementById("gender").value,
    dob: document.getElementById("dob").value || null,
    role: document.getElementById("role").value,
    business_name: document.getElementById("businessName").value,
    business_description: document.getElementById("businessDescription").value,
  };

  if (!validateForm(payload)) {
    return;
  }

  if (payload.role !== "VENDOR") {
    delete payload.business_name;
    delete payload.business_description;
  }

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Registering...";

  const result = await apiRequest("/auth/register/", "POST", payload);

  submitButton.disabled = false;
  submitButton.textContent = "Register";

  if (result.ok) {
    formMessage.textContent = result.data.message + "Redirecting to login...";
    formMessage.className = "success";
    form.reset();
    toggleVendorFields();
     setTimeout(()=>{
      window.location.href="login.html";

     },2000);

  } else {
    formMessage.textContent = "Please fix the errors below.";
    formMessage.className = "error";

    const fieldIdMap = {
      first_name: "firstName",
      last_name: "lastName",
      email: "email",
      password: "password",
      phone: "phone",
      gender: "gender",
      business_name: "businessName",
    };

    for (const field in result.data) {
      const fieldId = fieldIdMap[field];
      if (fieldId) {
        showFieldError(fieldId, result.data[field][0]);
      }
    }
  }
});