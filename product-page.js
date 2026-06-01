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

function productInitials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function renderImage(product) {
  const alt = escapeHtml(product.imageAlt || product.name);
  if (product.imageUrl) {
    return `<img class="product-detail__image" src="${escapeHtml(product.imageUrl)}" alt="${alt}" />`;
  }
  return `<div class="product-detail__placeholder" aria-label="${alt}">${productInitials(product.name)}</div>`;
}

async function addToCart(productId) {
  if (!requireCustomerLogin(window.location.pathname + window.location.search)) return;

  try {
    await customerApi("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    document.dispatchEvent(new Event("customerSessionChanged"));
    const status = document.getElementById("productStatus");
    if (status) {
      status.textContent = "Added to cart!";
      status.hidden = false;
      status.classList.remove("error");
    }
  } catch (err) {
    const status = document.getElementById("productStatus");
    if (status) {
      status.textContent = err.message;
      status.hidden = false;
      status.classList.add("error");
    }
  }
}

async function loadProduct() {
  const container = document.getElementById("productDetail");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    container.innerHTML = '<p class="product-error">No product selected. <a href="index.html">Browse the shop</a>.</p>';
    return;
  }

  try {
    const product = await fetch(`/api/products/${encodeURIComponent(id)}`).then((r) => {
      if (!r.ok) throw new Error();
      return r.json();
    });

    document.title = `${product.name} — Computer Store`;

    const crumbs = document.querySelector("[data-breadcrumbs]");
    if (crumbs) {
      crumbs.innerHTML = `<ol>
        <li><a href="index.html">Home</a></li>
        <li><span aria-current="page">${escapeHtml(product.name)}</span></li>
      </ol>`;
      crumbs.hidden = false;
    }

    const specs = (product.specs || [])
      .map((s) => `<li>${escapeHtml(s)}</li>`)
      .join("");
    const stockLabel = product.inStock ? "In stock" : "Enquire for availability";
    const stockClass = product.inStock ? "in-stock" : "out-of-stock";

    container.innerHTML = `
      <article class="product-detail">
        <div class="product-detail__media">${renderImage(product)}</div>
        <div class="product-detail__info">
          <h1>${escapeHtml(product.name)}</h1>
          <p class="product-detail__price">${formatPrice(product.price, product.currency)}</p>
          <p class="product-stock ${stockClass}">${stockLabel}</p>
          <ul class="product-detail__specs">${specs}</ul>
          <div class="product-detail__actions">
            <button type="button" class="button" id="addToCartBtn" ${product.inStock ? "" : "disabled"}>
              Add to cart
            </button>
            <a class="button button-secondary" href="contact.html?product=${encodeURIComponent(product.id)}&name=${encodeURIComponent(product.name)}">Enquire</a>
          </div>
          <p class="form-status" id="productStatus" hidden role="status"></p>
          <p class="muted product-detail__hint">You must <a href="account.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}">sign in or create an account</a> to use the cart.</p>
        </div>
      </article>
    `;

    document.getElementById("addToCartBtn")?.addEventListener("click", () => addToCart(product.id));
  } catch {
    container.innerHTML =
      '<p class="product-error">Product not found. <a href="index.html">Back to shop</a>.</p>';
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadProduct);
} else {
  loadProduct();
}
