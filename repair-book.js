const form = document.getElementById("repairForm");
const authRequired = document.getElementById("authRequired");
const statusEl = document.getElementById("repairStatus");

function init() {
  if (!isCustomerLoggedIn()) {
    authRequired.hidden = false;
    form.hidden = true;
    return;
  }
  authRequired.hidden = true;
  form.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!requireCustomerLogin("repair-book.html")) return;

  statusEl.hidden = true;
  const data = new FormData(form);

  try {
    const ticket = await customerApi("/api/repairs", {
      method: "POST",
      body: JSON.stringify({
        deviceType: data.get("deviceType"),
        deviceModel: data.get("deviceModel"),
        issueDescription: data.get("issueDescription"),
      }),
    });
    statusEl.textContent = `Repair ticket ${ticket.id} created. Estimated completion: ${new Date(ticket.etaAt).toLocaleString("en-GB")}.`;
    statusEl.classList.remove("error");
    statusEl.hidden = false;
    form.reset();
    setTimeout(() => {
      window.location.href = `my-repairs.html`;
    }, 2000);
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.classList.add("error");
    statusEl.hidden = false;
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
