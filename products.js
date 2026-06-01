function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatPrice(amount, currency) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function productUrl(id) {
  return `product.html?id=${encodeURIComponent(id)}`;
}

function productInitials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function renderProductImage(product) {
  const alt = escapeHtml(product.imageAlt || product.name);
  if (product.imageUrl) {
    return `<img class="product-image__img" src="${escapeHtml(product.imageUrl)}" alt="${alt}" loading="lazy" />`;
  }
  return `<span class="product-image__initials" aria-hidden="true">${productInitials(product.name)}</span>`;
}

function renderProductCard(product, currency) {
  const stockLabel = product.inStock ? "In stock" : "Enquire for availability";
  const stockClass = product.inStock ? "in-stock" : "out-of-stock";
  const specs = (product.specs || [])
    .slice(0, 3)
    .map((spec) => `<li>${escapeHtml(spec)}</li>`)
    .join("");

  return `
    <a class="product-card product-card--link" href="${productUrl(product.id)}">
      <div class="product-image">
        ${renderProductImage(product)}
      </div>
      <div class="product-body">
        <h2 class="product-name">${escapeHtml(product.name)}</h2>
        <p class="product-price">${formatPrice(product.price, currency)}</p>
        <p class="product-stock ${stockClass}">${stockLabel}</p>
        <ul class="product-specs">${specs}</ul>
        <span class="button product-view">View product</span>
      </div>
    </a>
  `;
}

async function fetchCategoryProducts(category) {
  const url = `/api/products?category=${encodeURIComponent(category)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to load products");
  }
  return response.json();
}

async function loadProducts() {
  const grids = document.querySelectorAll("[data-products]");
  if (!grids.length) return;

  await Promise.all(
    Array.from(grids).map(async (grid) => {
      const category = grid.dataset.products;
      try {
        const catalog = await fetchCategoryProducts(category);
        const items = catalog.products || [];

        if (!items.length) {
          grid.innerHTML =
            '<p class="product-empty">No items listed yet. <a href="contact.html">Contact us</a> for availability.</p>';
          return;
        }

        grid.innerHTML = items
          .map((product) => renderProductCard(product, catalog.currency))
          .join("");
      } catch {
        grid.innerHTML =
          '<p class="product-error">Could not load products. Run <code>npm start</code>, then open <a href="/">http://localhost:3000</a>.</p>';
      }
    })
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadProducts);
} else {
  loadProducts();
}
