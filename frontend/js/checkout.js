if (!isLoggedIn()) {
  window.location.href = "login.html";
}

let cartData = null;
let addresses = [];
let selectedAddressId = null;

function authHeaders() {
  return { "Authorization": `Bearer ${localStorage.getItem("access_token")}` };
}

function addressCardHTML(addr) {
  const checked = addr.id === selectedAddressId ? "checked" : "";
  const selectedClass = addr.id === selectedAddressId ? "is-selected" : "";
  return `<label class="addr-card ${selectedClass}" onclick="selectAddress(${addr.id})">
    <input type="radio" name="selectedAddress" ${checked}>
    <div>
      <div>${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}</div>
      <div style="color:var(--ink-soft);font-size:13px">${addr.city}, ${addr.state} - ${addr.pincode}</div>
      ${addr.is_default ? '<span class="badge badge-green" style="margin-top:6px">Default</span>' : ''}
    </div>
  </label>`;
}

function selectAddress(id) {
  selectedAddressId = id;
  renderCheckout();
}

function renderCheckout() {
  const layout = document.getElementById("checkoutLayout");

  if (!cartData || cartData.items.length === 0) {
    layout.innerHTML = `
      <div class="card" style="padding:40px;text-align:center;grid-column:1/-1">
        <p style="color:var(--ink-soft);margin-bottom:16px">Your cart is empty.</p>
        <button class="btn btn-primary" onclick="window.location.href='products.html'">Start Shopping</button>
      </div>`;
    return;
  }

  layout.innerHTML = `
    <div>
      <div class="card panel" style="margin-bottom:20px">
        <h3 style="font-size:15px;margin-bottom:14px">Delivery Address</h3>
        <div id="addressList">
          ${addresses.length === 0
            ? '<p style="color:var(--ink-soft);font-size:13.5px">No saved addresses yet. Add one below.</p>'
            : addresses.map(addressCardHTML).join("")}
        </div>
        <button class="btn btn-outline btn-sm" style="margin-top:10px" onclick="toggleAddForm()">+ Add new address</button>

        <form id="addAddressForm" style="display:none;margin-top:16px;border-top:1px solid var(--line);padding-top:16px">
          <div class="field"><label>Address Line 1</label><input type="text" id="newLine1" required></div>
          <div class="field"><label>Address Line 2 (optional)</label><input type="text" id="newLine2"></div>
          <div class="field-row">
            <div class="field"><label>City</label><input type="text" id="newCity" required></div>
            <div class="field"><label>State</label><input type="text" id="newState" required></div>
          </div>
          <div class="field"><label>Pincode</label><input type="text" id="newPincode" required></div>
          <label style="font-size:13px;display:flex;gap:6px;align-items:center;margin-bottom:12px">
            <input type="checkbox" id="newIsDefault"> Set as default address
          </label>
          <button type="submit" class="btn btn-primary btn-sm">Save Address</button>
        </form>
      </div>

      <div class="card panel">
        <h3 style="font-size:15px;margin-bottom:14px">Order Items</h3>
        ${cartData.items.map(item => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px">
            <span>${item.name} × ${item.quantity}</span>
            <span class="price">₹${Number(item.line_total).toLocaleString('en-IN')}</span>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="card summary-box">
      <h3 style="font-size:16px;margin-bottom:18px">Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><span class="price">₹${cartData.subtotal.toLocaleString('en-IN')}</span></div>
      <div class="summary-row"><span>Shipping &amp; tax</span><span class="price" style="color:var(--ink-soft)">Calculated at order placement</span></div>
      <div class="summary-row total"><span>Total</span><span class="price">₹${cartData.subtotal.toLocaleString('en-IN')}</span></div>
      <button class="btn btn-primary btn-block" style="margin-top:18px" id="placeOrderBtn" onclick="placeOrder()">Place Order</button>
      <p style="text-align:center;font-size:11.5px;margin-top:12px;color:#9C9CB0">🔒 Secure checkout</p>
    </div>
  `;

  document.getElementById("addAddressForm").addEventListener("submit", handleAddAddress);
}

function toggleAddForm() {
  const form = document.getElementById("addAddressForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

async function handleAddAddress(event) {
  event.preventDefault();

  const payload = {
    address_line1: document.getElementById("newLine1").value,
    address_line2: document.getElementById("newLine2").value,
    city: document.getElementById("newCity").value,
    state: document.getElementById("newState").value,
    pincode: document.getElementById("newPincode").value,
    is_default: document.getElementById("newIsDefault").checked,
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/api/auth/addresses/", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const newAddr = await response.json();
      addresses.push(newAddr);
      selectedAddressId = newAddr.id;
      renderCheckout();
    } else {
      alert("Could not save address. Please check your input.");
    }
  } catch (error) {
    alert("Could not reach the server.");
  }
}

async function placeOrder() {
  if (!selectedAddressId) {
    alert("Please select or add a delivery address first.");
    return;
  }

  const addr = addresses.find(a => a.id === selectedAddressId);
  const shippingAddress = `${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}, ${addr.city}, ${addr.state} - ${addr.pincode}`;

  const placeOrderBtn = document.getElementById("placeOrderBtn");
  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = "Placing order...";

  try {
    const response = await fetch("http://127.0.0.1:8003/api/orders/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ shipping_address: shippingAddress }),
    });

    const data = await response.json();

    if (response.ok) {
      showOrderConfirmation(data);
    } else {
      alert(data.detail || "Could not place order. Please try again.");
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = "Place Order";
    }
  } catch (error) {
    alert("Could not reach Order Service. Please try again.");
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = "Place Order";
  }
}

function showOrderConfirmation(order) {
  const layout = document.getElementById("checkoutLayout");
  layout.innerHTML = `
    <div class="card" style="padding:48px;text-align:center;grid-column:1/-1">
      <div style="font-size:44px;margin-bottom:12px">✅</div>
      <h2 style="margin-bottom:8px">Order placed successfully!</h2>
      <p style="color:var(--ink-soft);margin-bottom:6px">Order #${order.id} · Total ₹${Number(order.total_amount).toLocaleString('en-IN')}</p>
      <p style="color:var(--ink-soft);font-size:13px;margin-bottom:24px">Status: ${order.status}</p>
      <button class="btn btn-primary" onclick="window.location.href='products.html'">Continue Shopping</button>
    </div>
  `;
}

async function loadCheckoutData() {
  try {
    const [cartRes, addrRes] = await Promise.all([
      fetch(`${CART_API_BASE}/cart/`, { headers: authHeaders() }),
      fetch("http://127.0.0.1:8000/api/auth/addresses/", { headers: authHeaders() }),
    ]);
    cartData = await cartRes.json();
    addresses = await addrRes.json();

    const defaultAddr = addresses.find(a => a.is_default);
    selectedAddressId = defaultAddr ? defaultAddr.id : (addresses[0] ? addresses[0].id : null);

    renderCheckout();
  } catch (error) {
    document.getElementById("checkoutLayout").innerHTML =
      `<p style="color:var(--ink-soft);font-size:13.5px">Could not load checkout data. Make sure Cart Service and Auth Service are running.</p>`;
  }
}

loadCheckoutData();