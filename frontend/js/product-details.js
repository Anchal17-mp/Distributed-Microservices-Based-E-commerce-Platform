const PRODUCT_API_BASE_PD = "http://127.0.0.1:8001/api";

const CATEGORY_EMOJI_PD = {
  "Electronics": "📱", "Fashion": "👗", "Home & Living": "🏠",
  "Home & Kitchen": "🏠", "Beauty": "💄", "Sports": "🏋️", "Toys & Kids": "🧸",
};

function getProductIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

function renderProduct(product) {
  const emoji = CATEGORY_EMOJI_PD[product.category_name] || "🛍️";
  const inStock = product.stock_quantity > 0;

  document.title = `${product.name} - Bazaario`;

  document.getElementById("pdContent").innerHTML = `
    <div class="pd-grid">
      <div>
        <div class="pd-gallery-main">${emoji}</div>
      </div>
      <div class="pd-info">
        <span class="prod-vendor">Sold by Vendor #${product.vendor_id}</span>
        <h1>${product.name}</h1>
        <div class="pd-rating-row">
          <span class="badge ${inStock ? 'badge-green' : 'badge-red'}">${inStock ? 'In stock' : 'Out of stock'}</span>
        </div>
        <div class="pd-price-row">
          <span class="price">₹${Number(product.price).toLocaleString('en-IN')}</span>
        </div>
        <p class="pd-desc">${product.description || 'No description provided.'}</p>

        <div style="margin-top:24px">
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:10px">Quantity</label>
          <div class="qty-stepper">
            <button onclick="stepQty(-1)">−</button><span id="qtyVal">1</span><button onclick="stepQty(1)">+</button>
          </div>
        </div>

        <div class="pd-actions">
          <button class="btn btn-dark" style="flex:1" ${inStock ? '' : 'disabled'} onclick="addToCart(${product.id},qty)">
            <svg class="ic" viewBox="0 0 24 24" style="width:16px;height:16px"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.5 3h2l2.7 12.4A2 2 0 0 0 9.1 17H18a2 2 0 0 0 2-1.6L21.5 8h-16"/></svg>
            Add to Cart
          </button>
        </div>

        <div class="pd-meta-list">
          <div><b>Category</b>${product.category_name || '—'}</div>
          <div><b>Stock</b>${product.stock_quantity} units available</div>
        </div>
      </div>
    </div>
  `;
}

let qty = 1;
function stepQty(delta) {
  qty = Math.max(1, qty + delta);
  document.getElementById("qtyVal").textContent = qty;
}

async function loadProductDetails() {
  const id = getProductIdFromUrl();
  if (!id) {
    document.getElementById("pdContent").innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">No product specified.</p>`;
    return;
  }

  try {
    const response = await fetch(`${PRODUCT_API_BASE_PD}/products/${id}/`);
    if (!response.ok) {
      document.getElementById("pdContent").innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">Product not found.</p>`;
      return;
    }
    const product = await response.json();
    renderProduct(product);
  } catch (error) {
    document.getElementById("pdContent").innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">Could not load product. Is Product Service running?</p>`;
  }
}

loadProductDetails();