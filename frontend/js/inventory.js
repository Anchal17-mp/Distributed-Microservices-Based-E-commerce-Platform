const PRODUCT_API_BASE_INV = GATEWAY_BASE;
const LOW_STOCK_THRESHOLD_INV = 5;
const MAX_STOCK_REFERENCE = 100; // for the visual level bar only

let myProducts = [];

function getVendorIdInv() {
  const payload = decodeToken();
  return payload ? Number(payload.user_id) : null;
}

function stockStatus(qty) {
  if (qty === 0) return { label: "Out of stock", badge: "badge-red", fillClass: "out" };
  if (qty <= LOW_STOCK_THRESHOLD_INV) return { label: "Low stock", badge: "badge-amber", fillClass: "low" };
  return { label: "In stock", badge: "badge-green", fillClass: "" };
}

function inventoryRowHTML(product) {
  const status = stockStatus(product.stock_quantity);
  const fillWidth = Math.min(100, Math.round((product.stock_quantity / MAX_STOCK_REFERENCE) * 100));

  return `<tr>
    <td><div class="t-prod"><div class="t-thumb">🛍️</div>${product.name}</div></td>
    <td>${product.stock_quantity} units</td>
    <td><div class="stock-track"><div class="stock-fill ${status.fillClass}" style="width:${fillWidth}%"></div></div></td>
    <td><span class="badge ${status.badge}">${status.label}</span></td>
    <td>
      <input type="number" min="0" class="stock-input" id="stockInput-${product.id}" value="${product.stock_quantity}">
      <button class="btn btn-outline btn-sm" onclick="updateStock(${product.id})">Save</button>
    </td>
  </tr>`;
}

function renderInventory() {
  const tbody = document.getElementById("inventoryTableBody");

  if (myProducts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--ink-soft);font-size:13.5px;padding:20px 0">You haven't listed any products yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = myProducts.map(inventoryRowHTML).join("");

  const lowCount = myProducts.filter(p => p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD_INV).length;
  const outCount = myProducts.filter(p => p.stock_quantity === 0).length;

  const badgesEl = document.getElementById("stockBadges");
  badgesEl.innerHTML = `
    ${lowCount > 0 ? `<span class="badge badge-amber">${lowCount} low stock</span>` : ''}
    ${outCount > 0 ? `<span class="badge badge-red">${outCount} out of stock</span>` : ''}
  `;
}

async function loadInventory() {
  const vendorId = getVendorIdInv();
  try {
    const response = await fetch(`${PRODUCT_API_BASE_INV}/products/`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    const products = await response.json();
    myProducts = products.filter(p => p.vendor_id === vendorId);
    renderInventory();
  } catch (error) {
    document.getElementById("inventoryTableBody").innerHTML =
      `<tr><td colspan="5" style="color:var(--ink-soft);font-size:13.5px;padding:20px 0">Could not load inventory. Is Product Service running?</td></tr>`;
  }
}

async function updateStock(productId) {
  const input = document.getElementById(`stockInput-${productId}`);
  const newStock = parseInt(input.value, 10);

  if (isNaN(newStock) || newStock < 0) {
    alert("Please enter a valid stock number.");
    return;
  }

  try {
    const response = await fetch(`${PRODUCT_API_BASE_INV}/products/${productId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ stock_quantity: newStock }),
    });

    if (response.ok) {
      const updated = await response.json();
      const index = myProducts.findIndex(p => p.id === productId);
      myProducts[index] = updated;
      renderInventory();
    } else {
      alert("Could not update stock. Please try again.");
    }
  } catch (error) {
    alert("Could not reach Product Service.");
  }
}

loadInventory();