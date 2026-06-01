const guestView = document.getElementById("guestView");
const loggedInView = document.getElementById("loggedInView");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const accountName = document.getElementById("accountName");
const logoutBtn = document.getElementById("logoutBtn");
const repairListContainer = document.getElementById("repairListContainer");
const newRepairForm = document.getElementById("newRepairForm");
const repairFormError = document.getElementById("repairFormError");
const repairFormSuccess = document.getElementById("repairFormSuccess");
const repairDetailsPanel = document.getElementById("repairDetailsPanel");
const repairStatusFilter = document.getElementById("repairStatusFilter");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const repairToast = document.getElementById("repairToast");
const notificationList = document.getElementById("notificationList");
const notificationPanel = document.getElementById("notificationPanel");
const notificationCount = document.getElementById("notificationCount");

let _currentPage = 1;
const PAGE_SIZE = 6;
let _lastUpdateCheck = null;
let _repairControlsInitialized = false;

function showToast(message) {
  repairToast.textContent = message;
  repairToast.hidden = false;
  setTimeout(() => (repairToast.hidden = true), 4000);
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function showAuthView(loggedIn) {
  guestView.hidden = loggedIn;
  loggedInView.hidden = !loggedIn;
  if (loggedIn) {
    accountName.textContent = getCustomerName() || "there";
    loadRepairHistory(1);
  } else {
    repairListContainer.innerHTML = "";
    repairDetailsPanel.hidden = true;
  }
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
}

function renderRepairNotifications(tickets) {
  if (!notificationList || !notificationPanel) return;

  if (!tickets || !tickets.length) {
    notificationCount.hidden = true;
    notificationList.innerHTML = '<li class="muted">No notifications yet.</li>';
    return;
  }

  const latestNotifications = tickets
    .slice(0, 4)
    .map((ticket) => {
      const label = ticket.statusLabel ? `Status updated to ${escapeHtml(ticket.statusLabel)}` : 'Repair status changed';
      return `
        <li class="notification-list-item">
          <strong>Ticket ${escapeHtml(ticket.id)}</strong>
          <span>${label}</span>
          <time>${formatDateTime(ticket.updatedAt)}</time>
        </li>
      `;
    })
    .join("");

  notificationCount.textContent = tickets.length;
  notificationCount.hidden = false;
  notificationList.innerHTML = latestNotifications;
}

async function loadRepairHistory(page = 1) {
  if (!isCustomerLoggedIn()) return;
  try {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    const status = repairStatusFilter?.value || "";
    if (status) params.set('status', status);
    const data = await customerApi(`/api/repairs/mine?${params.toString()}`);
    const tickets = data.tickets || [];
    const total = Number(data.total || 0);
    const pageSize = Number(data.pageSize || PAGE_SIZE);
    const pages = Math.max(1, Math.ceil(total / pageSize));

    _currentPage = Number(data.page || page);
    pageInfo.textContent = `Page ${_currentPage} of ${pages}`;
    prevPageBtn.disabled = _currentPage <= 1;
    nextPageBtn.disabled = _currentPage >= pages;

    if (!tickets.length) {
      repairListContainer.innerHTML = '<p class="muted">No repair tickets found.</p>';
      return;
    }

    repairListContainer.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Device</th>
              <th>Status</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${tickets.map((ticket) => `
              <tr>
                <td><strong>${escapeHtml(ticket.id)}</strong></td>
                <td>${escapeHtml(ticket.deviceType)} ${escapeHtml(ticket.deviceModel || '')}</td>
                <td><span class="status-pill">${escapeHtml(ticket.statusLabel)}</span></td>
                <td>${formatDateTime(ticket.updatedAt)}</td>
                <td><button type="button" class="button button-small" data-ticket-id="${escapeHtml(ticket.id)}">View</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    repairListContainer.querySelectorAll("button[data-ticket-id]").forEach((btn) => {
      btn.addEventListener("click", () => showRepairDetails(btn.dataset.ticketId));
    });

    if (!_repairControlsInitialized) {
      repairStatusFilter?.addEventListener('change', () => loadRepairHistory(1));
      prevPageBtn?.addEventListener('click', () => loadRepairHistory(Math.max(1, _currentPage - 1)));
      nextPageBtn?.addEventListener('click', () => loadRepairHistory(_currentPage + 1));
      _repairControlsInitialized = true;
    }

    renderRepairNotifications(tickets);

    const latest = tickets[0]?.updatedAt;
    if (latest) _lastUpdateCheck = latest;
  } catch (err) {
    repairListContainer.innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`;
  }
}

async function pollForUpdates() {
  if (!isCustomerLoggedIn()) return;
  try {
    const params = new URLSearchParams({ page: '1', pageSize: '1' });
    const data = await customerApi(`/api/repairs/mine?${params.toString()}`);
    const ticket = (data.tickets || [])[0];
    const latest = ticket?.updatedAt;
    if (latest && _lastUpdateCheck && latest > _lastUpdateCheck) {
      showToast('You have new updates on your repair tickets');
      _lastUpdateCheck = latest;
      loadRepairHistory(_currentPage);
    }
  } catch (e) {
    // ignore polling errors
  }
}

setInterval(pollForUpdates, 30000);

async function showRepairDetails(ticketId) {
  try {
    const ticket = await customerApi(`/api/repairs/mine/${ticketId}`);
    repairDetailsPanel.hidden = false;
    repairDetailsPanel.innerHTML = `
      <h2>Ticket ${escapeHtml(ticket.id)}</h2>
      <p><strong>Status:</strong> ${escapeHtml(ticket.statusLabel)}</p>
      <p><strong>Device:</strong> ${escapeHtml(ticket.deviceType)} ${escapeHtml(ticket.deviceModel || "")}</p>
      <p><strong>Problem:</strong> ${escapeHtml(ticket.issueDescription)}</p>
      <p><strong>Created:</strong> ${formatDateTime(ticket.createdAt)}</p>
      <p><strong>Last updated:</strong> ${formatDateTime(ticket.updatedAt)}</p>
      <h3>Updates</h3>
      <ul class="updates-list">
        ${
          (ticket.updates || [])
            .map(
              (update) => `
                <li>
                  <strong>${escapeHtml(update.staffName)}</strong> ${formatDateTime(update.createdAt)}<br>
                  ${escapeHtml(update.message)}
                </li>
              `
            )
            .join("") || "<li class='muted'>No updates yet.</li>"
        }
      </ul>
      <button type="button" class="button button-secondary" id="closeRepairDetails">Close details</button>
    `;
    document.getElementById("closeRepairDetails").addEventListener("click", () => {
      repairDetailsPanel.hidden = true;
    });
  } catch (err) {
    repairDetailsPanel.hidden = false;
    repairDetailsPanel.innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`;
  }
}

function redirectAfterAuth() {
  const target = loginRedirectUrl("index.html");
  window.location.href = target;
}

document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const isLogin = tab.dataset.authTab === "login";
    loginForm.hidden = !isLogin;
    registerForm.hidden = isLogin;
  });
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  const data = new FormData(loginForm);
  try {
    const result = await fetch("/api/customer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.get("email"),
        password: data.get("password"),
      }),
    }).then(async (r) => {
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || "Login failed");
      return body;
    });
    setCustomerSession(result.token, result.name);
    document.dispatchEvent(new Event("customerSessionChanged"));
    redirectAfterAuth();
  } catch (err) {
    loginError.textContent = err.message;
    loginError.hidden = false;
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  registerError.hidden = true;
  const data = new FormData(registerForm);
  try {
    const result = await fetch("/api/customer/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
      }),
    }).then(async (r) => {
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || "Registration failed");
      return body;
    });
    setCustomerSession(result.token, result.name);
    document.dispatchEvent(new Event("customerSessionChanged"));
    redirectAfterAuth();
  } catch (err) {
    registerError.textContent = err.message;
    registerError.hidden = false;
  }
});

newRepairForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  repairFormError.hidden = true;
  repairFormSuccess.hidden = true;

  try {
    const data = new FormData(newRepairForm);
    await customerApi("/api/repairs", {
      method: "POST",
      body: JSON.stringify({
        deviceType: data.get("deviceType"),
        deviceModel: data.get("deviceModel"),
        issueDescription: data.get("issueDescription"),
      }),
    });

    repairFormSuccess.textContent = "Repair request submitted successfully.";
    repairFormSuccess.hidden = false;
    newRepairForm.reset();
    loadRepairHistory();
    setTimeout(() => {
      repairFormSuccess.hidden = true;
    }, 4000);
  } catch (err) {
    repairFormError.textContent = err.message;
    repairFormError.hidden = false;
  }
});


logoutBtn.addEventListener("click", () => {
  clearCustomerSession();
  document.dispatchEvent(new Event("customerSessionChanged"));
  showAuthView(false);
});

if (isCustomerLoggedIn()) {
  showAuthView(true);
} else {
  showAuthView(false);
}
