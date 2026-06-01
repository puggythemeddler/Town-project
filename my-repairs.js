function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

async function loadTickets() {
  const container = document.getElementById("ticketsList");
  const authRequired = document.getElementById("authRequired");

  if (!isCustomerLoggedIn()) {
    authRequired.hidden = false;
    container.innerHTML = "";
    return;
  }

  authRequired.hidden = true;

  try {
    const { tickets } = await customerApi("/api/repairs/mine");

    if (!tickets.length) {
      container.innerHTML =
        '<p class="product-empty">No repair tickets yet. <a href="repair-book.html">Book a repair</a>.</p>';
      return;
    }

    container.innerHTML = tickets
      .map((t) => {
        const updates = (t.updates || [])
          .filter((u) => u.customerVisible)
          .map(
            (u) =>
              `<li><time>${formatDateTime(u.createdAt)}</time> — ${escapeHtml(u.message)}</li>`
          )
          .join("");

        return `
        <article class="ticket-card panel">
          <header class="ticket-card__head">
            <h2>${escapeHtml(t.id)}</h2>
            <span class="status-pill">${escapeHtml(t.statusLabel)}</span>
          </header>
          <p><strong>${escapeHtml(t.deviceType)}</strong> ${escapeHtml(t.deviceModel)}</p>
          <p>${escapeHtml(t.issueDescription)}</p>
          <p class="ticket-meta"><strong>Estimated ready:</strong> ${formatDateTime(t.etaAt)}</p>
          ${t.scheduledAt ? `<p class="ticket-meta"><strong>Scheduled:</strong> ${formatDateTime(t.scheduledAt)}</p>` : ""}
          ${t.customerNotes ? `<p class="ticket-meta"><strong>Note from us:</strong> ${escapeHtml(t.customerNotes)}</p>` : ""}
          ${updates ? `<ul class="ticket-updates">${updates}</ul>` : ""}
        </article>
      `;
      })
      .join("");
  } catch (err) {
    if (err.status === 401) {
      window.location.href = "account.html?redirect=my-repairs.html";
      return;
    }
    container.innerHTML = `<p class="product-error">${escapeHtml(err.message)}</p>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadTickets);
} else {
  loadTickets();
}
