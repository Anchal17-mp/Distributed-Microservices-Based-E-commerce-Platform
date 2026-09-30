const PRODUCT_API_BASE_PL = GATEWAY_BASE;

let allListingProducts = [];
let allCategories = [];
let activeCategoryFilter = "all";

const CATEGORY_EMOJI_PL = {
  "Electronics": "📱", "Fashion": "👗", "Home & Living": "🏠",
  "Home & Kitchen": "🏠", "Beauty": "💄", "Sports": "🏋️", "Toys & Kids": "🧸",
};

function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

let vendorNameMap = {};

async function loadVendorNames() {
  try {
    const res = await fetch('${GATEWAY_BASE}/auth/vendors/');
    const vendors = await res.json();
    vendors.forEach(v => { vendorNameMap[v.user] = v.business_name; });
  } catch (error) {
    
  }
}

function listingCardHTML(product) {
  const emoji = CATEGORY_EMOJI_PL[product.category_name] || "🛍️";
  const mediaContent = product.image
    ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover">`
    : emoji;
  return `<div class="prod-card" onclick="window.location.href='product-details.html?id=${product.id}'">
    <div class="prod-media">${mediaContent}</div>
    <div class="prod-body">
      <span class="prod-vendor">${vendorNameMap[product.vendor_id] || 'Vendor #' + product.vendor_id}</span>
      <div class="prod-title">${product.name}</div>
      <div class="prod-price-row">
        <div><span class="price">₹${Number(product.price).toLocaleString('en-IN')}</span></div>
    
      </div>
    </div>
  </div>`;
}

function applyFiltersAndRender() {
  let filtered = [...allListingProducts];

  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
  }

  if (activeCategoryFilter !== "all") {
    filtered = filtered.filter(p => String(p.category) === activeCategoryFilter);
  }

  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;
  if (minPrice) filtered = filtered.filter(p => Number(p.price) >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter(p => Number(p.price) <= Number(maxPrice));

  if (document.getElementById("inStockOnly").checked) {
    filtered = filtered.filter(p => p.stock_quantity > 0);
  }

  const sortBy = document.getElementById("sortSelect").value;
  if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
  else filtered.sort((a, b) => b.id - a.id);

  document.getElementById("resultsCount").textContent = `Showing ${filtered.length} of ${allListingProducts.length} results`;

  const grid = document.getElementById("listingGrid");
  grid.innerHTML = filtered.length === 0
    ? `<p style="color:var(--ink-soft);font-size:13.5px">No products match your filters.</p>`
    : filtered.map(listingCardHTML).join("");
}

async function loadListingData() {
  try {
    const [catRes, prodRes] = await Promise.all([
      fetch(`${PRODUCT_API_BASE_PL}/categories/`),
      fetch(`${PRODUCT_API_BASE_PL}/products/`),
       loadVendorNames(),
    ]);
    allCategories = await catRes.json();
    allListingProducts = await prodRes.json();

    const chipsEl = document.getElementById("categoryChips");
    allCategories.forEach(cat => {
      const chip = document.createElement("span");
      chip.className = "pill";
      chip.dataset.category = cat.id;
      chip.textContent = cat.name;
      chipsEl.appendChild(chip);
    });

    const urlCategory = getUrlParam("category");
    if (urlCategory) {
      activeCategoryFilter = urlCategory;
      document.querySelectorAll("#categoryChips .pill").forEach(c => {
        c.classList.toggle("is-active", c.dataset.category === urlCategory);
      });
    }

    applyFiltersAndRender();
  } catch (error) {
    document.getElementById("listingGrid").innerHTML =
      `<p style="color:var(--ink-soft);font-size:13.5px">Could not load products. Is Product Service running?</p>`;
    document.getElementById("resultsCount").textContent = "";
  }
}

document.getElementById("categoryChips").addEventListener("click", function (e) {
  if (!e.target.classList.contains("pill")) return;
  document.querySelectorAll("#categoryChips .pill").forEach(c => c.classList.remove("is-active"));
  e.target.classList.add("is-active");
  activeCategoryFilter = e.target.dataset.category;
  applyFiltersAndRender();
});

["searchInput", "minPrice", "maxPrice", "sortSelect"].forEach(id => {
  document.getElementById(id).addEventListener("input", applyFiltersAndRender);
});
document.getElementById("inStockOnly").addEventListener("change", applyFiltersAndRender);

document.getElementById("resetFiltersBtn").addEventListener("click", function () {
  document.getElementById("searchInput").value = "";
  document.getElementById("minPrice").value = "";
  document.getElementById("maxPrice").value = "";
  document.getElementById("inStockOnly").checked = false;
  document.getElementById("sortSelect").value = "newest";
  activeCategoryFilter = "all";
  document.querySelectorAll("#categoryChips .pill").forEach(c => c.classList.remove("is-active"));
  document.querySelector('#categoryChips .pill[data-category="all"]').classList.add("is-active");
  applyFiltersAndRender();
});

loadListingData();