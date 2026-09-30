const ORDER_API_BASE_V = GATEWAY_BASE;

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function statusBadgeClass(status) {
  const map = {
    PENDING: "badge-amber", CONFIRMED: "badge-green",
    SHIPPED: "badge-green", DELIVERED: "badge-green", CANCELLED: "badge-red",
  };
  return map[status] || "badge-amber";
}

function vendorOrderRowHTML(item) {
  const date = new Date(item.order_created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const options = STATUS_OPTIONS.map(s => `<option value="${s}" ${s === item.order_status ? 'selected' : ''}>${s}</option>`).join("");

  return `<tr>
    <td class="mono">#${item.order}</td>
    <td>${item.product_name}</td>
    <td>${item.quantity}</td>
    <td class="price">₹${Number(item.price * item.quantity).toLocaleString('en-IN')}</td>
    <td>${date}</td>
    <td>
      <select class="status-select" onchange="updateOrderStatus(${item.order}, this.value)">
        ${options}
      </select>
    </td>
  </tr>`;
}

async function loadVendorOrders() {
  try {
    const response = await fetch(`${ORDER_API_BASE_V}/orders/vendor-items/`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    const items = await response.json();
    const tbody = document.getElementById("vendorOrdersBody");

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--ink-soft);font-size:13.5px;padding:20px 0">No orders yet for your products.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(vendorOrderRowHTML).join("");
  } catch (error) {
    document.getElementById("vendorOrdersBody").innerHTML =
      `<tr><td colspan="6" style="color:var(--ink-soft);font-size:13.5px;padding:20px 0">Could not load orders. Is Order Service running?</td></tr>`;
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await fetch(`${ORDER_API_BASE_V}/orders/${orderId}/update-status/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      alert("Could not update order status.");
      loadVendorOrders();
    }
  } catch (error) {
    alert("Could not reach Order Service.");
  }
}

loadVendorOrders();