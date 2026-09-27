const PRODUCT_API_BASE = "http://127.0.0.1:8001/api";

const CATEGORY_EMOJI = {
  "Electronics": "📱",
  "Fashion": "👗",
  "Home & Living": "🏠",
  "Home & Kitchen": "🏠",
  "Beauty": "💄",
  "Sports": "🏋️",
  "Toys & Kids": "🧸",
};

function productCardHTML(product) {
  const emoji = CATEGORY_EMOJI[product.category_name] || "🛍️";
  const mediaContent = product.image
    ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover">`
    : emoji;
  return `<div class="prod-card" onclick="window.location.href='product-details.html?id=${product.id}'">
    <div class="prod-media">${mediaContent}</div>
    <div class="prod-body">
      <span class="prod-vendor">Vendor #${product.vendor_id}</span>
      <div class="prod-title">${product.name}</div>
      <div class="prod-price-row">
        <div><span class="price">₹${Number(product.price).toLocaleString('en-IN')}</span></div>
        <button class="add-btn" onclick="event.stopPropagation();addToCart({$product.id})">+</button>
      </div>
    </div>
  </div>`;
}

async function loadHomeData() {
  try {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${PRODUCT_API_BASE}/categories/`),
      fetch(`${PRODUCT_API_BASE}/products/`),
    ]);
    const categories = await categoriesRes.json();
    const products = await productsRes.json();

    const categoryStrip = document.getElementById("categoryStrip");
    if (categoryStrip) {
      categoryStrip.innerHTML = categories.map((cat) => `
        <div class="cat-tile" onclick="window.location.href='products.html?category=${cat.id}'">
          <div class="em">${CATEGORY_EMOJI[cat.name] || "🛍️"}</div>
          <span>${cat.name}</span>
        </div>
      `).join("");
    }

    const featuredGrid = document.getElementById("featuredGrid");
    const bestSellingGrid = document.getElementById("bestSellingGrid");

    if (products.length === 0) {
      if (featuredGrid) featuredGrid.innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">No products yet — check back soon.</p>`;
      if (bestSellingGrid) bestSellingGrid.innerHTML = "";
    } else {
      if (featuredGrid) featuredGrid.innerHTML = products.slice(0, 4).map(productCardHTML).join("");
      if (bestSellingGrid) bestSellingGrid.innerHTML = products.slice(4, 8).map(productCardHTML).join("");
    }

    document.getElementById("statProducts").textContent = products.length;
    document.getElementById("statVendors").textContent = new Set(products.map(p => p.vendor_id)).size;

  } catch (error) {
    console.log("Could not load home data:", error);
    const featuredGrid = document.getElementById("featuredGrid");
    if (featuredGrid) featuredGrid.innerHTML = `<p style="color:var(--ink-soft);font-size:13.5px">Could not load products. Is Product Service running?</p>`;
  }
}

loadHomeData();
function goToSearch() {
  const term = document.getElementById("homeSearchInput").value.trim();
  if (term) {
    window.location.href = `products.html?search=${encodeURIComponent(term)}`;
  }
}