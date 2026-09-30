const AUTH_BASE_A = "http://127.0.0.1:8000/api";
const PRODUCT_BASE_A = "http://127.0.0.1:8001/api";

function authHeadersA() {
  return { "Authorization": `Bearer ${localStorage.getItem("access_token")}` };
}

document.querySelectorAll(".side-link[data-tab]").forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll(".side-link[data-tab]").forEach(l => l.classList.remove("is-active"));
    document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("is-active"));
    this.classList.add("is-active");
    document.getElementById(`admin-${this.dataset.tab}`).classList.add("is-active");
  });
});

async function loadUsers() {
  const res = await fetch(`${AUTH_BASE_A}/auth/admin/users/`, { headers: authHeadersA() });
  const users = await res.json();
  document.getElementById("usersTableBody").innerHTML = users.map(u => `
    <tr>
      <td>${u.first_name} ${u.last_name}</td>
      <td>${u.email}</td>
      <td><span class="badge badge-green">${u.role}</span></td>
      <td>${u.is_active ? 'Yes' : 'No'}</td>
      <td>${new Date(u.created_at).toLocaleDateString('en-IN')}</td>
    </tr>
  `).join("");
  return users;
}

async function loadVendors() {
  const res = await fetch(`${AUTH_BASE_A}/auth/admin/vendors/`, { headers: authHeadersA() });
  const vendors = await res.json();
  document.getElementById("vendorsTableBody").innerHTML = vendors.map(v => `
    <tr>
      <td>${v.business_name}</td>
      <td>${v.full_name}</td>
      <td>${v.email}</td>
      <td><span class="badge ${v.approval_status === 'APPROVED' ? 'badge-green' : v.approval_status === 'REJECTED' ? 'badge-red' : 'badge-amber'}">${v.approval_status}</span></td>
      <td>
        ${v.approval_status !== 'APPROVED' ? `<button class="btn btn-outline btn-sm" onclick="updateVendorStatus(${v.id}, 'APPROVED')">Approve</button>` : ''}
        ${v.approval_status !== 'REJECTED' ? `<button class="btn btn-outline btn-sm" onclick="updateVendorStatus(${v.id}, 'REJECTED')">Reject</button>` : ''}
      </td>
    </tr>
  `).join("");
  return vendors;
}

async function updateVendorStatus(vendorId, newStatus) {
  await fetch(`${AUTH_BASE_A}/auth/admin/vendors/${vendorId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeadersA() },
    body: JSON.stringify({ approval_status: newStatus }),
  });
  loadVendors();
  loadOverviewStats();
}

async function loadProducts() {
  const res = await fetch(`${PRODUCT_BASE_A}/products/admin/`, { headers: authHeadersA() });
  const products = await res.json();
  document.getElementById("productsTableBody").innerHTML = products.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>Vendor #${p.vendor_id}</td>
      <td class="price">₹${Number(p.price).toLocaleString('en-IN')}</td>
      <td>${p.stock_quantity}</td>
      <td>${p.is_active ? 'Yes' : 'No'}</td>
      <td><button class="btn btn-outline btn-sm" onclick="toggleProductActive(${p.id}, ${!p.is_active})">${p.is_active ? 'Deactivate' : 'Activate'}</button></td>
    </tr>
  `).join("");
  return products;
}

async function toggleProductActive(productId, newActive) {
  await fetch(`${PRODUCT_BASE_A}/products/admin/${productId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeadersA() },
    body: JSON.stringify({ is_active: newActive }),
  });
  loadProducts();
  loadOverviewStats();
}

async function loadOverviewStats() {
  const [users, vendors, products] = await Promise.all([loadUsers(), loadVendors(), loadProducts()]);
  document.getElementById("statTotalUsers").textContent = users.length;
  document.getElementById("statTotalVendors").textContent = vendors.length;
  document.getElementById("statPendingVendors").textContent = vendors.filter(v => v.approval_status === 'PENDING').length;
  document.getElementById("statTotalProducts").textContent = products.length;
}

loadOverviewStats();