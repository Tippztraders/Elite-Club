// === Domain Storage ===
function getDomains() {
  return JSON.parse(localStorage.getItem("domains")) || [];
}

function saveDomains(domains) {
  localStorage.setItem("domains", JSON.stringify(domains));
  renderDomains();
}

// === Render Table ===
function renderDomains() {
  const tbody = document.querySelector("#domainTable tbody");
  tbody.innerHTML = "";
  getDomains().forEach((domain, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${domain.name}</td>
      <td>${domain.expiry}</td>
      <td>
        <button onclick="deleteDomain(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// === Add Domain ===
document.querySelector("#addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.querySelector("#domainName").value;
  const expiry = document.querySelector("#expiryDate").value;
  const domains = getDomains();
  domains.push({ name, expiry });
  saveDomains(domains);
  e.target.reset();
});

// === Delete Domain ===
function deleteDomain(index) {
  const domains = getDomains();
  domains.splice(index, 1);
  saveDomains(domains);
}

// === Scan Expiry ===
function scanNow() {
  const today = new Date();
  getDomains().forEach((d) => {
    const expDate = new Date(d.expiry);
    const daysLeft = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) {
      console.log(`⚠️ ${d.name} expires in ${daysLeft} days`);
      // TODO: send email here
    }
  });
}

// === Export CSV ===
function exportCsv() {
  const rows = [["Domain", "Expiry"], ...getDomains().map(d => [d.name, d.expiry])];
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "domains.csv";
  a.click();
}

// === Init ===
document.addEventListener("DOMContentLoaded", renderDomains);
