const NAV_LINKS = [
  { id: "home", label: "Home", href: "index.html" },
  { id: "pc", label: "PCs", href: "pc.html" },
  { id: "laptops", label: "Laptops", href: "laptops.html" },
  { id: "servers", label: "Servers", href: "servers.html" },
  { id: "printers", label: "Printers", href: "printer.html" },
  { id: "repairs", label: "Repairs", href: "repairs.html" },
  { id: "contact", label: "Contact", href: "contact.html" },
  { id: "cart", label: "Cart", href: "cart.html", badge: true },
  { id: "account", label: "Sign in", href: "account.html", idAttr: "accountNavLink" },
];

const PAGE_BREADCRUMBS = {
  "index.html": [{ label: "Home" }],
  "pc.html": [
    { label: "Home", href: "index.html" },
    { label: "PCs" },
  ],
  "laptops.html": [
    { label: "Home", href: "index.html" },
    { label: "Laptops" },
  ],
  "servers.html": [
    { label: "Home", href: "index.html" },
    { label: "Servers" },
  ],
  "printer.html": [
    { label: "Home", href: "index.html" },
    { label: "Printers" },
  ],
  "repairs.html": [
    { label: "Home", href: "index.html" },
    { label: "Repairs" },
  ],
  "repair-book.html": [
    { label: "Home", href: "index.html" },
    { label: "Repairs", href: "repairs.html" },
    { label: "Book repair" },
  ],
  "my-repairs.html": [
    { label: "Home", href: "index.html" },
    { label: "Repairs", href: "repairs.html" },
    { label: "My tickets" },
  ],
  "contact.html": [
    { label: "Home", href: "index.html" },
    { label: "Contact" },
  ],
  "account.html": [
    { label: "Home", href: "index.html" },
    { label: "Account" },
  ],
  "cart.html": [
    { label: "Home", href: "index.html" },
    { label: "Cart" },
  ],
  "product.html": [{ label: "Home", href: "index.html" }],
  "gaming-laptops.html": [
    { label: "Home", href: "index.html" },
    { label: "Laptops", href: "laptops.html" },
    { label: "Gaming Laptops" },
  ],
  "windows-laptops.html": [
    { label: "Home", href: "index.html" },
    { label: "Laptops", href: "laptops.html" },
    { label: "Windows Laptops" },
  ],
  "mac-laptops.html": [
    { label: "Home", href: "index.html" },
    { label: "Laptops", href: "laptops.html" },
    { label: "Mac Laptops" },
  ],
  "gaming-pcs.html": [
    { label: "Home", href: "index.html" },
    { label: "PCs", href: "pc.html" },
    { label: "Gaming PCs" },
  ],
  "business-pcs.html": [
    { label: "Home", href: "index.html" },
    { label: "PCs", href: "pc.html" },
    { label: "Business PCs" },
  ],
  "mac-desktops.html": [
    { label: "Home", href: "index.html" },
    { label: "PCs", href: "pc.html" },
    { label: "Mac Desktops" },
  ],
  "rack-servers.html": [
    { label: "Home", href: "index.html" },
    { label: "Servers", href: "servers.html" },
    { label: "Rack Servers" },
  ],
  "tower-servers.html": [
    { label: "Home", href: "index.html" },
    { label: "Servers", href: "servers.html" },
    { label: "Tower Servers" },
  ],
  "blade-servers.html": [
    { label: "Home", href: "index.html" },
    { label: "Servers", href: "servers.html" },
    { label: "Blade Servers" },
  ],
};

const STORE = {
  name: "Computer Store",
  phone: "01234 567890",
  email: "sales@computerstore.example",
  currency: "GBP",
  year: new Date().getFullYear(),
};

async function loadStoreSettings() {
  try {
    const response = await fetch("/api/settings");
    if (!response.ok) return;
    const settings = await response.json();
    STORE.name = settings.storeName || STORE.name;
    STORE.phone = settings.phone || STORE.phone;
    STORE.email = settings.email || STORE.email;
    STORE.currency = settings.currency || STORE.currency;
  } catch {
    /* server not running — defaults used */
  }
}

function ensurePwaMeta() {
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = "/manifest.webmanifest";
    document.head.appendChild(link);
  }
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#1d4ed8";
    document.head.appendChild(meta);
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

function currentPageName() {
  const path = window.location.pathname;
  const file = path.split("/").pop() || "index.html";
  return file.includes(".") ? file : "index.html";
}

function renderHeader(activeNav) {
  const headerEl = document.getElementById("site-header");
  if (!headerEl) return;

  const navHtml = NAV_LINKS.map((link) => {
    const active = link.id === activeNav ? ' class="active" aria-current="page"' : "";
    const idAttr = link.idAttr ? ` id="${link.idAttr}"` : "";
    const badge =
      link.badge
        ? ' <span class="cart-badge" id="cartBadge" hidden aria-label="Items in cart">0</span>'
        : "";
    return `<a href="${link.href}"${idAttr}${active}>${link.label}${badge}</a>`;
  }).join("");

  headerEl.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <div class="header-top">
          <div class="left-controls">
            <button type="button" id="categorySpringToggle" class="spring-toggle" aria-expanded="false" aria-controls="categorySpring">Categories</button>
            <a class="brand" href="index.html">${STORE.name}</a>
          </div>
          <div class="right-controls">
            <button type="button" id="themeToggle" class="theme-toggle" aria-pressed="false">Dark</button>
            <button type="button" class="menu-toggle" id="menuToggle" aria-expanded="false" aria-controls="mainNav">Menu</button>
          </div>
        </div>
        <nav class="main-nav" id="mainNav" aria-label="Main">
          ${navHtml}
        </nav>
      </div>
    </header>
  `;

  if (typeof updateAccountNav === "function") updateAccountNav();
  if (typeof updateCartBadge === "function") updateCartBadge();
}

// Category springboard
async function loadAndRenderCategories() {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) return;
    const data = await res.json();
    const cats = data.categories || [];
    let container = document.getElementById('categorySpring');
    if (!container) {
      container = document.createElement('div');
      container.id = 'categorySpring';
      container.className = 'category-spring';
      document.body.appendChild(container);
    }
    container.innerHTML = `<div class="spring-inner"><h3>Categories</h3><ul>${cats.map(c=>`<li><a href="${c.id}.html">${escapeHtml(c.label)}</a></li>`).join('')}</ul></div>`;
  } catch (e) {
    // ignore
  }
}

function initCategorySpringboard() {
  const toggle = document.getElementById('categorySpringToggle');
  if (!toggle) return;
  toggle.addEventListener('click', async () => {
    const el = document.getElementById('categorySpring');
    if (!el || el.classList.toggle('open')) {
      await loadAndRenderCategories();
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('spring-open');
    } else {
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('spring-open');
    }
  });
  document.addEventListener('click', (ev) => {
    const spring = document.getElementById('categorySpring');
    if (!spring) return;
    if (!spring.contains(ev.target) && ev.target.id !== 'categorySpringToggle') {
      spring.classList.remove('open');
      document.body.classList.remove('spring-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Theme toggle
function applyTheme(theme) {
  if (theme === 'dark') document.documentElement.classList.add('theme-dark');
  else document.documentElement.classList.remove('theme-dark');
  try { document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0f172a' : '#1d4ed8'; } catch(e){}
}

function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const saved = localStorage.getItem('siteTheme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);
  btn.textContent = saved === 'dark' ? 'Light' : 'Dark';
  btn.setAttribute('aria-pressed', saved === 'dark' ? 'true' : 'false');
  btn.addEventListener('click', () => {
    const current = document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('siteTheme', next);
    applyTheme(next);
    btn.textContent = next === 'dark' ? 'Light' : 'Dark';
    btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
  });
}

// Initialize extras after DOM
document.addEventListener('DOMContentLoaded', () => {
  initCategorySpringboard();
  initThemeToggle();
});

function renderBreadcrumbs() {
  const container = document.querySelector("[data-breadcrumbs]");
  if (!container) return;

  const crumbs = PAGE_BREADCRUMBS[currentPageName()];
  if (!crumbs || crumbs.length <= 1) {
    container.hidden = true;
    return;
  }

  const items = crumbs
    .map((crumb, index) => {
      const isLast = index === crumbs.length - 1;
      if (isLast || !crumb.href) {
        return `<li><span aria-current="page">${crumb.label}</span></li>`;
      }
      return `<li><a href="${crumb.href}">${crumb.label}</a></li>`;
    })
    .join("");

  container.innerHTML = `<ol>${items}</ol>`;
  container.hidden = false;
}

function renderFooter() {
  const footerEl = document.getElementById("site-footer");
  if (!footerEl) return;

  footerEl.innerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">
        <p class="footer-brand">${STORE.name} &copy; ${STORE.year}</p>
        <p class="footer-contact">
          <a href="tel:${STORE.phone.replace(/\s/g, "")}">${STORE.phone}</a>
          &middot;
          <a href="mailto:${STORE.email}">${STORE.email}</a>
        </p>
        <nav class="footer-nav" aria-label="Footer">
          <a href="contact.html">Enquire</a>
          <a href="/backoffice/">Back office</a>
          <a href="repairs.html">Repairs</a>
          <a href="index.html">Home</a>
        </nav>
      </div>
    </footer>
  `;
}

function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  if (!menuToggle || !mainNav) return;

  const closeMenu = () => {
    mainNav.classList.remove("show");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("show");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function initContactForm() {
  const form = document.getElementById("enquireForm");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const productField = form.querySelector('[name="product"]');
  const productId = params.get("product");
  const productName = params.get("name");

  if (productField && (productId || productName)) {
    productField.value = productName
      ? `${productName}${productId ? ` (${productId})` : ""}`
      : productId;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`Enquiry: ${data.get("product") || "General"}`);
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name")}`,
        `Phone: ${data.get("phone")}`,
        `Email: ${data.get("email")}`,
        `Product: ${data.get("product") || "Not specified"}`,
        "",
        "Message:",
        data.get("message") || "",
      ].join("\n")
    );
    window.location.href = `mailto:${STORE.email}?subject=${subject}&body=${body}`;
    const status = document.getElementById("formStatus");
    if (status) {
      status.textContent =
        "Your email app should open with your enquiry. If it did not, email us directly at " +
        STORE.email;
      status.hidden = false;
    }
  });
}

async function initSite() {
  ensurePwaMeta();
  registerServiceWorker();
  await loadStoreSettings();

  const activeNav = document.body.dataset.activeNav || "";
  renderHeader(activeNav);
  renderBreadcrumbs();
  renderFooter();
  initMobileMenu();
  initContactForm();

  document.addEventListener("customerSessionChanged", () => {
    if (typeof updateAccountNav === "function") updateAccountNav();
    if (typeof updateCartBadge === "function") updateCartBadge();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initSite();
  });
} else {
  initSite();
}
