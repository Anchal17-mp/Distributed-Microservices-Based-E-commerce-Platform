if (!isLoggedIn()) {
  window.location.href = "login.html";
}

let cartData = null;

function cartItemHTML(item) {
  return `<div class="cart-item" data-item-id="${item.id}">
    <div class="cart-thumb">🛍️</div>
    <div><h4>${item.name}</h4><span class="prod-vendor">${item.stock_quantity} in stock</span></div>
    <div class="qty-stepper">
      <button onclick="changeQty(${item.id}, ${item.quantity - 1})">-</button>
      <span>${item.quantity}</span>
      <button onclick="changeQty(${item.id}, ${item.quantity + 1})">+</button>
    </div>
    <span class="price">₹${Number(item.price).toLocaleString('en-IN')}</span>
    <button class="cart-remove" onclick="removeItem(${item.id})">✕</button>
  </div>`;
}

function renderCart() {
  const layout = document.getElementById("cartLayout");
  const countLabel = document.getElementById("itemCountLabel");

  if (!cartData || cartData.items.length === 0) {
    countLabel.textContent = "";
    layout.innerHTML = `
      <div class="card" style="padding:40px;text-align:center;grid-column:1/-1">
        <p style="color:var(--ink-soft);margin-bottom:16px">Your cart is empty.</p>
        <button class="btn btn-primary" onclick="window.location.href='products.html'">Start Shopping</button>
      </div>`;
    return;
  }

  countLabel.textContent = `(${cartData.item_count} item${cartData.item_count > 1 ? 's' : ''})`;

  layout.innerHTML = `
    <div>
      <div class="card" style="padding:8px 24px">
        ${cartData.items.map(cartItemHTML).join("")}
      </div>
    </div>
    <div class="card summary-box">
      <h3 style="font-size:16px;margin-bottom:18px">Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><span class="price">₹${cartData.subtotal.toLocaleString('en-IN')}</span></div>
      <div class="summary-row"><span>Shipping &amp; tax</span><span class="price" style="color:var(--ink-soft)">Calculated at checkout</span></div>
      <div class="summary-row total"><span>Total</span><span class="price">₹${cartData.subtotal.toLocaleString('en-IN')}</span></div>
      <button class="btn btn-primary btn-block" style="margin-top:18px" onclick="window.location.href='checkout.html'">Proceed to Checkout</button>
      <p style="text-align:center;font-size:11.5px;margin-top:12px;color:#9C9CB0">🔒 Secure checkout</p>
    </div>
  `;
}

async function loadCart() {
  try {
    const response = await fetch(`${CART_API_BASE}/cart/`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    if (!response.ok) {
      document.getElementById("cartLayout").innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">Could not load your cart.</p>`;
      return;
    }
    cartData = await response.json();
    renderCart();
  } catch (error) {
    document.getElementById("cartLayout").innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">Could not reach the cart service. Is it running on port 8002?</p>`;
  }
}

async function changeQty(itemId, newQty) {
  if (newQty < 1) {
    removeItem(itemId);
    return;
  }
  try {
    const response = await fetch(`${CART_API_BASE}/cart/items/${itemId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ quantity: newQty }),
    });
    if (response.ok) {
      loadCart();
    } else {
      const data = await response.json();
      alert(data.detail || "Could not update quantity.");
    }
  } catch (error) {
    alert("Could not update quantity.");
  }
}

async function removeItem(itemId) {
  if (!confirm("Remove this item from your cart?")) return;

  try {
    const response = await fetch(`${CART_API_BASE}/cart/items/${itemId}/`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
    });
    if (response.ok || response.status === 204) {
      loadCart();
    } else {
      alert("Could not remove item.");
    }
  } catch (error) {
    alert("Could not remove item.");
  }
}

loadCart();