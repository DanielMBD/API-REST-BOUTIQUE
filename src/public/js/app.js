const state = {
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),
  cart: null
};

const formatMoney = (value) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " FCFA";

function headers(auth = false) {
  const result = { "Content-Type": "application/json" };
  if (auth && state.token) result.Authorization = `Bearer ${state.token}`;
  return result;
}

function showAlert(message, type = "success") {
  document.getElementById("alertArea").innerHTML =
    `<div class="alert alert-${type} alert-dismissible fade show">${message}<button class="btn-close" data-bs-dismiss="alert"></button></div>`;
}

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Une erreur est survenue");
  return data;
}

function refreshSessionUI() {
  document.getElementById("userLabel").textContent = state.user ? `${state.user.name} (${state.user.role})` : "";
  document.getElementById("logoutBtn").classList.toggle("d-none", !state.user);
  document.getElementById("ordersSection").classList.toggle("d-none", !state.user);
  if (state.user) {
    document.getElementById("shippingAddress").value = state.user.address || "";
    loadCart();
    loadOrders();
  } else {
    renderCart(null);
  }
}

async function loadCategories() {
  const data = await api("/api/categories");
  const select = document.getElementById("categorySelect");
  data.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category._id;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

async function loadProducts() {
  const search = encodeURIComponent(document.getElementById("searchInput").value.trim());
  const category = document.getElementById("categorySelect").value;
  const data = await api(`/api/products?search=${search}&category=${category}`);

  document.getElementById("productsGrid").innerHTML = data.products.map((product) => `
    <div class="col-sm-6 col-lg-4">
      <article class="card product-card">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <span class="badge text-bg-secondary align-self-start mb-2">${product.category?.name || ""}</span>
          <h3 class="h5">${product.name}</h3>
          <p class="text-secondary flex-grow-1">${product.description}</p>
          <p class="price mb-1">${formatMoney(product.price)}</p>
          <p class="small text-muted">Stock : ${product.stock}</p>
          <button class="btn btn-success" onclick="addToCart('${product._id}')">Ajouter au panier</button>
        </div>
      </article>
    </div>
  `).join("");
}

async function addToCart(productId) {
  if (!state.token) {
    showAlert("Connectez-vous avant d'ajouter un produit au panier.", "warning");
    return;
  }
  try {
    const data = await api("/api/cart/items", {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ productId, quantity: 1 })
    });
    state.cart = data.cart;
    renderCart(state.cart);
    showAlert("Produit ajouté au panier.");
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function loadCart() {
  try {
    const data = await api("/api/cart", { headers: headers(true) });
    state.cart = data.cart;
    renderCart(state.cart);
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

function renderCart(cart) {
  const items = cart?.items || [];
  document.getElementById("cartCount").textContent = items.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartTotal").textContent = formatMoney(cart?.total || 0);
  document.getElementById("cartItems").innerHTML = items.length
    ? items.map((item) => `
      <div class="border-bottom py-3">
        <div class="fw-semibold">${item.product?.name || "Produit"}</div>
        <div class="small text-muted">${formatMoney(item.unitPrice)} × ${item.quantity}</div>
        <div class="d-flex gap-2 mt-2">
          <input class="form-control form-control-sm" style="width:90px" type="number" min="1"
            value="${item.quantity}" onchange="updateCartItem('${item.product._id}', this.value)">
          <button class="btn btn-outline-danger btn-sm" onclick="removeCartItem('${item.product._id}')">Retirer</button>
        </div>
      </div>
    `).join("")
    : "<p class='text-muted'>Votre panier est vide.</p>";
}

async function updateCartItem(productId, quantity) {
  try {
    const data = await api(`/api/cart/items/${productId}`, {
      method: "PUT",
      headers: headers(true),
      body: JSON.stringify({ quantity: Number(quantity) })
    });
    state.cart = data.cart;
    renderCart(state.cart);
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function removeCartItem(productId) {
  const data = await api(`/api/cart/items/${productId}`, {
    method: "DELETE",
    headers: headers(true)
  });
  state.cart = data.cart;
  renderCart(state.cart);
}

async function checkout() {
  const shippingAddress = document.getElementById("shippingAddress").value.trim();
  try {
    const data = await api("/api/orders", {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ shippingAddress, paymentMethod: "mobile_money" })
    });

    const paid = await api("/api/payments/simulate", {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ orderId: data.order._id, method: "mobile_money" })
    });

    showAlert(`Commande créée et paiement simulé. Référence : ${paid.reference}`);
    await loadCart();
    await loadOrders();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function loadOrders() {
  if (!state.token) return;
  try {
    const data = await api("/api/orders/my-orders", { headers: headers(true) });
    document.getElementById("ordersList").innerHTML = data.orders.length
      ? data.orders.map((order) => `
        <div class="card mb-2">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <strong>Commande ${order._id.slice(-6).toUpperCase()}</strong>
              <span class="badge text-bg-dark">${order.status}</span>
            </div>
            <div>${formatMoney(order.totalAmount)}</div>
            <small class="text-muted">Paiement : ${order.payment.status} · ${new Date(order.createdAt).toLocaleString("fr-FR")}</small>
          </div>
        </div>
      `).join("")
      : "<p class='text-muted'>Aucune commande.</p>";
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
      })
    });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    bootstrap.Modal.getInstance(document.getElementById("authModal")).hide();
    refreshSessionUI();
    showAlert("Connexion réussie.");
  } catch (error) {
    showAlert(error.message, "danger");
  }
});

document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await api("/api/auth/register", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        name: document.getElementById("registerName").value,
        email: document.getElementById("registerEmail").value,
        password: document.getElementById("registerPassword").value,
        address: document.getElementById("registerAddress").value
      })
    });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    bootstrap.Modal.getInstance(document.getElementById("authModal")).hide();
    refreshSessionUI();
    showAlert("Compte créé avec succès.");
  } catch (error) {
    showAlert(error.message, "danger");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  state.token = null;
  state.user = null;
  refreshSessionUI();
  showAlert("Vous êtes déconnecté.", "secondary");
});

document.getElementById("searchBtn").addEventListener("click", loadProducts);
document.getElementById("checkoutBtn").addEventListener("click", checkout);

loadCategories();
loadProducts();
refreshSessionUI();
