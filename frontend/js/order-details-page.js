const ORDER_API_BASE_D = GATEWAY_BASE;

function getOrderIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

function orderStatusBadgeD(status) {
  const map = {
    PENDING: "badge-amber", CONFIRMED: "badge-green",
    SHIPPED: "badge-green", DELIVERED: "badge-green", CANCELLED: "badge-red",
  };
  return map[status] || "badge-amber";
}

function renderOrderDetail(order) {
  const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById("orderDetailContent").innerHTML = `
    <div class="card panel" style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="font-size:16px">Order #${order.id}</h3>
          <p style="color:var(--ink-soft);font-size:13px">Placed on ${date}</p>
        </div>
        <span class="badge ${orderStatusBadgeD(order.status)}">${order.status}</span>
      </div>
    </div>

    <div class="card panel" style="margin-bottom:20px">
      <h3 style="font-size:15px;margin-bottom:12px">Delivery Address</h3>
      <p style="font-size:13.5px;color:var(--ink-soft)">${order.shipping_address}</p>
    </div>

    <div class="card panel">
      <h3 style="font-size:15px;margin-bottom:14px">Items</h3>
      ${order.items.map(item => `
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.5px">
          <span>${item.product_name} × ${item.quantity}</span>
          <span class="price">₹${Number(item.price * item.quantity).toLocaleString('en-IN')}</span>
        </div>
      `).join("")}
      <div style="display:flex;justify-content:space-between;padding-top:14px;font-weight:700">
        <span>Total</span>
        <span class="price">₹${Number(order.total_amount).toLocaleString('en-IN')}</span>
      </div>
    </div>
  `;
}

async function loadOrderDetail() {
  const id = getOrderIdFromUrl();
  if (!id) {
    document.getElementById("orderDetailContent").innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">No order specified.</p>`;
    return;
  }

  try {
    const response = await fetch(`${ORDER_API_BASE_D}/orders/${id}/`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    if (!response.ok) {
      document.getElementById("orderDetailContent").innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">Order not found.</p>`;
      return;
    }
    const order = await response.json();
    renderOrderDetail(order);
  } catch (error) {
    document.getElementById("orderDetailContent").innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">Could not load order. Is Order Service running?</p>`;
  }
}

loadOrderDetail();