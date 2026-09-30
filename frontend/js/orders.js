const ORDER_API_BASE = GATEWAY_BASE;

function orderStatusBadge(status) {
  const map = {
    PENDING: "badge-amber",
    CONFIRMED: "badge-green",
    SHIPPED: "badge-green",
    DELIVERED: "badge-green",
    CANCELLED: "badge-red",
  };
  return map[status] || "badge-amber";
}

function orderRowHTML(order) {
  const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const itemCount = order.items.length;

  return `<tr>
    <td class="mono">#${order.id}</td>
    <td>${date}</td>
    <td>${itemCount} item${itemCount > 1 ? 's' : ''}</td>
    <td class="price">₹${Number(order.total_amount).toLocaleString('en-IN')}</td>
    <td><span class="badge ${orderStatusBadge(order.status)}">${order.status}</span></td>
    <td><button class="btn btn-outline btn-sm" onclick="window.location.href='order-details.html?id=${order.id}'">View</button></td>
  </tr>`;
}

async function loadOrders() {
  try {
    const response = await fetch(`${ORDER_API_BASE}/orders/`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    const orders = await response.json();
    const tbody = document.getElementById("ordersTableBody");

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--ink-soft);font-size:13.5px;padding:20px 0">You haven't placed any orders yet. <a href="../products.html">Start shopping →</a></td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(orderRowHTML).join("");
  } catch (error) {
    document.getElementById("ordersTableBody").innerHTML =
      `<tr><td colspan="6" style="color:var(--ink-soft);font-size:13.5px;padding:20px 0">Could not load orders. Is Order Service running?</td></tr>`;
  }
}

loadOrders();