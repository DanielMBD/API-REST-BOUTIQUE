let token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user") || "null");

const formatMoney = (value) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " FCFA";

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function adminAlert(message, type = "success") {
  document.getElementById("adminAlert").innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur");
  return data;
}

function setView() {
  const allowed = token && user?.role === "admin";
  document.getElementById("adminLogin").classList.toggle("d-none", allowed);
  document.getElementById("adminPanel").classList.toggle("d-none", !allowed);
  if (allowed) loadDashboard();
}

async function loadDashboard() {
  try {
    await Promise.all([loadStats(), loadCategories(), loadProducts(), loadOrders()]);
  } catch (error) {
    adminAlert(error.message, "danger");
  }
}

async function loadStats() {
  const data = await api("/api/admin/stats", { headers: authHeaders() });
  const cards = [
    ["Produits", data.stats.products],
    ["Clients", data.stats.clients],
    ["Commandes", data.stats.orders],
    ["Chiffre d'affaires", formatMoney(data.stats.revenue)],
    ["Stock faible", data.stats.lowStock],
    ["En attente", data.stats.pendingOrders]
  ];
  document.getElementById("statsGrid").innerHTML = cards.map(([label, value]) => `
    <div class="col-6 col-lg-2">
      <div class="card stat-card h-100"><div class="card-body">
        <div class="text-muted small">${label}</div>
        <div class="h4 mb-0">${value}</div>
      </div></div>
    </div>
  `).join("");
}

async function loadCategories() {
  const data = await api("/api/categories");
  document.getElementById("productCategory").innerHTML = data.categories
    .map((category) => `<option value="${category._id}">${category.name}</option>`)
    .join("");
}

async function loadProducts() {
  const data = await api("/api/products?limit=50");
  document.getElementById("adminProducts").innerHTML = data.products.map((product) => `
    <tr>
      <td>${product.name}</td>
      <td>${formatMoney(product.price)}</td>
      <td>${product.stock}</td>
      <td class="text-end">
        <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct('${product._id}')">Supprimer</button>
      </td>
    </tr>
  `).join("");
}

async function loadOrders() {
  const data = await api("/api/orders", { headers: authHeaders() });
  document.getElementById("adminOrders").innerHTML = data.orders.length
    ? data.orders.map((order) => `
      <div class="border-bottom py-3">
        <div><strong>${order.user?.name || "Client"}</strong> · ${formatMoney(order.totalAmount)}</div>
        <div class="small text-muted">${order.payment.status} · ${new Date(order.createdAt).toLocaleString("fr-FR")}</div>
        <select class="form-select form-select-sm mt-2" onchange="changeStatus('${order._id}', this.value)">
          ${["en_attente","confirmee","en_preparation","expediee","livree","annulee"]
            .map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </div>
    `).join("")
    : "<p class='text-muted'>Aucune commande.</p>";
}

async function changeStatus(id, status) {
  try {
    await api(`/api/orders/${id}/status`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    adminAlert("Statut mis à jour.");
    loadStats();
  } catch (error) {
    adminAlert(error.message, "danger");
  }
}

async function deleteProduct(id) {
  if (!confirm("Supprimer ce produit ?")) return;
  try {
    await api(`/api/products/${id}`, { method: "DELETE", headers: authHeaders() });
    adminAlert("Produit supprimé.");
    loadProducts();
    loadStats();
  } catch (error) {
    adminAlert(error.message, "danger");
  }
}

document.getElementById("adminLoginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("adminEmail").value,
        password: document.getElementById("adminPassword").value
      })
    });

    if (data.user.role !== "admin") throw new Error("Ce compte n'est pas administrateur");
    token = data.token;
    user = data.user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setView();
  } catch (error) {
    adminAlert(error.message, "danger");
  }
});

document.getElementById("productForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/products", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        name: document.getElementById("productName").value,
        description: document.getElementById("productDescription").value,
        price: Number(document.getElementById("productPrice").value),
        stock: Number(document.getElementById("productStock").value),
        image: document.getElementById("productImage").value || "https://placehold.co/600x400?text=Produit",
        category: document.getElementById("productCategory").value
      })
    });
    event.target.reset();
    adminAlert("Produit ajouté.");
    loadProducts();
    loadStats();
  } catch (error) {
    adminAlert(error.message, "danger");
  }
});

document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  token = null;
  user = null;
  setView();
});

setView();
