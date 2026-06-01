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

function renderCartItem(item, currency) {
  const image = item.imageUrl
    ? `<img src="${escapeHtml(item.imageUrl)}" alt="" class="cart-item__img" />`
    : `<span class="cart-item__placeholder">${escapeHtml(item.name.slice(0, 2))}</span>`;

  return `
    <article class="cart-item" data-id="${escapeHtml(item.productId)}">
      <a href="product.html?id=${encodeURIComponent(item.productId)}" class="cart-item__media">${image}</a>
      <div class="cart-item__body">
        <h2><a href="product.html?id=${encodeURIComponent(item.productId)}">${escapeHtml(item.name)}</a></h2>
        <p class="cart-item__price">${formatPrice(item.price, currency)} each</p>
        <div class="cart-item__qty">
          <label>Qty
            <input type="number" class="qty-input" min="1" value="${item.quantity}" />
          </label>
          <button type="button" class="btn-text remove-btn">Remove</button>
        </div>
      </div>
      <p class="cart-item__line">${formatPrice(item.lineTotal, currency)}</p>
    </article>
  `;
}

async function loadCart() {
  const container = document.getElementById("cartContent");
  const authMessage = document.getElementById("cartAuthMessage");

  if (!isCustomerLoggedIn()) {
    authMessage.hidden = false;
    authMessage.innerHTML =
      'Please <a href="account.html?redirect=cart.html">sign in or create an account</a> to view your cart.';
    container.innerHTML = "";
    return;
  }

  authMessage.hidden = true;

  try {
    const cart = await customerApi("/api/cart");

    if (!cart.items.length) {
      container.innerHTML =
        '<p class="product-empty">Your cart is empty. <a href="index.html">Continue shopping</a>.</p>';
      return;
    }

    container.innerHTML = `
      <div class="cart-list">
        ${cart.items.map((item) => renderCartItem(item, cart.currency)).join("")}
      </div>
      <footer class="cart-footer panel">
        <p class="cart-subtotal"><strong>Subtotal:</strong> ${formatPrice(cart.subtotal, cart.currency)}</p>
        <p class="muted">Checkout is not automated yet — use Enquire or contact the store to complete your order.</p>
        <div class="cart-footer__actions">
          <a class="button" href="contact.html">Complete enquiry</a>
          <button type="button" class="button button-secondary" id="clearCartBtn">Clear cart</button>
        </div>
      </footer>
    `;

    container.querySelectorAll(".qty-input").forEach((input) => {
      input.addEventListener("change", async () => {
        const row = input.closest(".cart-item");
        const productId = row.dataset.id;
        const quantity = Number(input.value);
        try {
          await customerApi(`/api/cart/${encodeURIComponent(productId)}`, {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
          });
          document.dispatchEvent(new Event("customerSessionChanged"));
          await loadCart();
        } catch (err) {
          alert(err.message);
        }
      });
    });

    container.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const productId = btn.closest(".cart-item").dataset.id;
        await customerApi(`/api/cart/${encodeURIComponent(productId)}`, { method: "DELETE" });
        document.dispatchEvent(new Event("customerSessionChanged"));
        await loadCart();
      });
    });

    document.getElementById("clearCartBtn")?.addEventListener("click", async () => {
      if (!confirm("Remove all items from your cart?")) return;
      await customerApi("/api/cart", { method: "DELETE" });
      document.dispatchEvent(new Event("customerSessionChanged"));
      await loadCart();
    });
  } catch (err) {
    if (err.status === 401) {
      clearCustomerSession();
      window.location.href = "account.html?redirect=cart.html";
      return;
    }
    container.innerHTML = `<p class="product-error">${escapeHtml(err.message)}</p>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadCart);
} else {
  loadCart();
}
