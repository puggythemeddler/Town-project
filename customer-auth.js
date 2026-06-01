const CUSTOMER_TOKEN_KEY = "customerStoreToken";
const CUSTOMER_NAME_KEY = "customerStoreName";

function getCustomerToken() {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

function getCustomerName() {
  return localStorage.getItem(CUSTOMER_NAME_KEY);
}

function setCustomerSession(token, name) {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_NAME_KEY, name);
}

function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_NAME_KEY);
}

function isCustomerLoggedIn() {
  return Boolean(getCustomerToken());
}

async function customerApi(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const token = getCustomerToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, { ...options, headers });
  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    const message = data?.error || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

function loginRedirectUrl(fallback = "cart.html") {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || fallback;
}

function requireCustomerLogin(redirectTarget) {
  if (isCustomerLoggedIn()) return true;
  const target = redirectTarget || window.location.pathname + window.location.search;
  window.location.href = `account.html?redirect=${encodeURIComponent(target)}`;
  return false;
}

async function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;

  if (!isCustomerLoggedIn()) {
    badge.hidden = true;
    return;
  }

  try {
    const data = await customerApi("/api/cart/count");
    const count = data.count || 0;
    badge.textContent = String(count);
    badge.hidden = count === 0;
  } catch {
    badge.hidden = true;
  }
}

function updateAccountNav() {
  const accountLink = document.getElementById("accountNavLink");
  if (!accountLink) return;

  if (isCustomerLoggedIn()) {
    accountLink.textContent = getCustomerName() || "Account";
    accountLink.href = "account.html";
  } else {
    accountLink.textContent = "Sign in";
    accountLink.href = "account.html";
  }
}

document.addEventListener("customerSessionChanged", () => {
  updateCartBadge();
  updateAccountNav();
});
