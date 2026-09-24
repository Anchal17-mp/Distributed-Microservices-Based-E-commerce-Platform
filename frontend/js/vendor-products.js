const PRODUCT_API_BASE_LIST = "http://127.0.0.1:8001/api";
const LOW_STOCK_THRESHOLD = 5;

let allProducts = [];
let activeFilter = "all";

function getVendorId() {
  const payload = decodeToken();
  return payload ?Number( payload.user_id) : null;
}

function productStatus(product) {
  if (!product.is_active) return { key: "out", label: "Inactive", badge: "badge-red" };
  if (product.stock_quantity === 0) return { key: "out", label: "Out of stock", badge: "badge-red" };
  if (product.stock_quantity <= LOW_STOCK_THRESHOLD) return { key: "low", label: "Low stock", badge: "badge-amber" };
  return { key: "active", label: "Active", badge: "badge-green" };
}

function renderTable() {
  const tbody = document.getElementById("productsTableBody");
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();

  let filtered = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
  if (activeFilter !== "all") {
    filtered = filtered.filter(p => productStatus(p).key === activeFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--ink-soft);font-size:13.5px;padding:20px 0">No products found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const status = productStatus(p);
    return `<tr>
      <td><div class="t-prod"><div class="t-thumb">🛍️</div>${p.name}</div></td>
      <td>${p.category_name || "—"}</td>
      <td class="price">₹${Number(p.price).toLocaleString('en-IN')}</td>
      <td>${p.stock_quantity}</td>
      <td><span class="badge ${status.badge}">${status.label}</span></td>
      <td><div class="row-actions">
        <button title="Edit" onclick="alert('Edit product coming soon')">✎</button>
        <button title="Delete" onclick="deleteProduct(${p.id})">🗑</button>
      </div></td>
    </tr>`;
  }).join("");
}

function updateFilterCounts() {
  const counts = { all: allProducts.length, active: 0, low: 0, out: 0 };
  allProducts.forEach(p => { counts[productStatus(p).key]++; });

  document.querySelectorAll("#filterChips .pill").forEach(chip => {
    const key = chip.dataset.filter;
    const label = { all: "All", active: "Active", low: "Low stock", out: "Out of stock" }[key];
    chip.textContent = `${label} (${counts[key]})`;
  });
}

async function loadVendorProducts() {
  const vendorId = getVendorId();
  try {
    const response = await fetch(`${PRODUCT_API_BASE_LIST}/products/`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    const products = await response.json();
    allProducts = products.filter(p => p.vendor_id === vendorId);
    updateFilterCounts();
    renderTable();
  } catch (error) {
    document.getElementById("productsTableBody").innerHTML =
      `<tr><td colspan="6" style="color:var(--ink-soft);font-size:13.5px;padding:20px 0">Could not load products. Is Product Service running?</td></tr>`;
  }
}

async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;

  try {
    const response = await fetch(`${PRODUCT_API_BASE_LIST}/products/${productId}/`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    if (response.ok) {
      allProducts = allProducts.filter(p => p.id !== productId);
      updateFilterCounts();
      renderTable();
    } else {
      alert("Failed to delete product. Please try again.");
    }
  } catch (error) {
    alert("Failed to delete product. Please check your connection.");
  }
}

document.getElementById("searchInput").addEventListener("input", renderTable);

document.querySelectorAll("#filterChips .pill").forEach(chip => {
  chip.addEventListener("click", function () {
    document.querySelectorAll("#filterChips .pill").forEach(c => c.classList.remove("is-active"));
    this.classList.add("is-active");
    activeFilter = this.dataset.filter;
    renderTable();
  });
});

loadVendorProducts();