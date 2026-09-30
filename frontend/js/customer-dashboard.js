async function loadCustomerOrderStats() {
  try {
    const res = await fetch('${GATEWAY_BASE}/orders/', {
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    const orders = await res.json();

    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

    document.getElementById("totalOrdersCount").textContent = orders.length;
    document.getElementById("pendingOrdersCount").textContent = pendingCount;
    document.getElementById("deliveredOrdersCount").textContent = deliveredCount;

    const recentList = document.getElementById("recentOrdersList");
    if (orders.length === 0) {
      recentList.innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px;padding:12px 0">You haven't placed any orders yet.</p>`;
      return;
    }

    const recent = orders.slice(0, 5);
    recentList.innerHTML = recent.map(order => `
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.5px">
        <span>Order #${order.id} — ₹${Number(order.total_amount).toLocaleString('en-IN')}</span>
        <span class="badge ${order.status === 'PENDING' ? 'badge-amber' : 'badge-green'}">${order.status}</span>
      </div>
    `).join("");
  } catch (error) {
    document.getElementById("recentOrdersList").innerHTML =
      `<p style="color:var(--ink-soft);font-size:13.5px;padding:12px 0">Could not load orders.</p>`;
  }
}

loadCustomerOrderStats();

async function loadRecommendations() {
  const grid = document.getElementById("recoGrid");
  try {
    const res = await fetch(`${GATEWAY_BASE}/products/`);
    const products = await res.json();
    const sample = products.slice(0, 4);

    if (sample.length === 0) {
      grid.innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">No products available yet.</p>`;
      return;
    }

    grid.innerHTML = sample.map(p => `
      <div class="prod-card" onclick="window.location.href='../product-details.html?id=${p.id}'">
        <div class="prod-media">${p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">` : '🛍️'}</div>
        <div class="prod-body">
          <div class="prod-title">${p.name}</div>
          <div class="prod-price-row"><span class="price">₹${Number(p.price).toLocaleString('en-IN')}</span></div>
        </div>
      </div>
    `).join("");
  } catch (error) {
    grid.innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">Could not load recommendations.</p>`;
  }
}

loadRecommendations();