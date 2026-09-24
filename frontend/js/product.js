const PRODUCT_API_BASE = "http://127.0.0.1:8001/api";

const form = document.getElementById("addProductForm");
const formMessage = document.getElementById("formMessage");
const categorySelect = document.getElementById("category");
const imageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");
const publishBtn = document.getElementById("publishBtn");

// --- Guard: only logged-in vendors should be here ---
function getUserRoleFromToken() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch {
    return null;
  }
}

const role = getUserRoleFromToken();
if (!role) {
  window.location.href = "../login.html";
} else if (role !== "VENDOR") {
  window.location.href = "../index.html";
}

// --- Load categories into the dropdown ---
async function loadCategories() {
  try {
    const response = await fetch(`${PRODUCT_API_BASE}/categories/`);
    const categories = await response.json();

    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    formMessage.textContent = "Could not load categories. Is Product Service running?";
    formMessage.className = "error";
  }
}
loadCategories();

// --- Show a thumbnail preview when an image is selected ---
imageInput.addEventListener("change", function () {
  imagePreview.innerHTML = "";
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const thumb = document.createElement("div");
    thumb.style.backgroundImage = `url(${e.target.result})`;
    thumb.style.backgroundSize = "cover";
    thumb.style.backgroundPosition = "center";
    imagePreview.appendChild(thumb);
  };
  reader.readAsDataURL(file);
});

// --- Submit the form ---
form.addEventListener("submit", async function (event) {
  event.preventDefault();
  formMessage.textContent = "";
  formMessage.className = "";

  const name = document.getElementById("productName").value.trim();
  const category = categorySelect.value;
  const price = document.getElementById("price").value;
  const stockQuantity = document.getElementById("stockQuantity").value;

  if (!name || !category || !price || !stockQuantity) {
    formMessage.textContent = "Please fill in all required fields.";
    formMessage.className = "error";
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("category", category);
  formData.append("description", document.getElementById("description").value);
  formData.append("price", price);
  formData.append("stock_quantity", stockQuantity);

  if (imageInput.files[0]) {
    formData.append("image", imageInput.files[0]);
  }

  publishBtn.disabled = true;
  publishBtn.textContent = "Publishing...";

  const result = await apiRequestFormDataCustom(formData);

  publishBtn.disabled = false;
  publishBtn.textContent = "Publish Product";

  if (result.ok) {
    formMessage.textContent = "Product published successfully!";
    formMessage.className = "success";
    form.reset();
    imagePreview.innerHTML = "";
  } else {
    formMessage.textContent = "Failed to publish product. Please check your input.";
    formMessage.className = "error";
    console.log(result.data);
  }
});

async function apiRequestFormDataCustom(formData) {
  const headers = {};
  const token = localStorage.getItem("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${PRODUCT_API_BASE}/products/`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}
