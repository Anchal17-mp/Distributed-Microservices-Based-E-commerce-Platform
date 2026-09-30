async function loadDashboardStats() {
  try {
    const res = await fetch("http://127.0.0.1:8001/api/products/");
    const products = await res.json();
    const payload = JSON.parse(atob(localStorage.getItem("access_token").split(".")[1]));
    const myProducts = products.filter(p => p.vendor_id === Number(payload.user_id));
    document.getElementById("activeProductsCount").textContent = myProducts.length;
  } catch (error) {
    document.getElementById("activeProductsCount").textContent = "0";
  }
}

async function loadOrderStats() {
  try {
    const res = await fetch("http://127.0.0.1:8003/api/orders/vendor-items/", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    const items = await res.json();

    const uniqueOrders = [...new Set(items.map(i => i.order))];
    const totalSales = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const pendingCount = items.filter(i => i.order_status === 'PENDING').length;

    document.getElementById("totalOrdersCount").textContent = uniqueOrders.length;
    document.getElementById("totalSalesAmount").textContent = `₹${totalSales.toLocaleString('en-IN')}`;
    document.getElementById("pendingOrdersCount").textContent = pendingCount;

    const recentList = document.getElementById("recentOrdersList");
    if (items.length === 0) {
      recentList.innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px;padding:12px 0">No orders yet.</p>`;
      return;
    }

    const recent = items.slice(0, 5);
    recentList.innerHTML = recent.map(item => `
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.5px">
        <span>#${item.order} — ${item.product_name} × ${item.quantity}</span>
        <span class="badge ${item.order_status === 'PENDING' ? 'badge-amber' : 'badge-green'}">${item.order_status}</span>
      </div>
    `).join("");
  } catch (error) {
    document.getElementById("recentOrdersList").innerHTML =
      `<p style="color:var(--ink-soft);font-size:13.5px;padding:12px 0">Could not load orders.</p>`;
  }
}

loadDashboardStats();
loadOrderStats();