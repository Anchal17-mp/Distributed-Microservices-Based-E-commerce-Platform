const CART_API_BASE = GATEWAY_BASE;

function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}

async function addToCart(productId, quantity = 1) {
  if (!isLoggedIn()) {
    if (confirm("Please log in to add items to your cart. Go to login now?")) {
      window.location.href = "login.html";
    }
    return;
  }

  try {
    const response = await fetch(`${CART_API_BASE}/cart/items/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ product_id: productId, quantity: quantity }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Added to cart!");
    } else {
      alert(data.detail || "Could not add item to cart.");
    }
  } catch (error) {
    alert("Could not reach the cart service. Please try again.");
  }
}