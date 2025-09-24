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



// === NEW: Add Domain via form and sync ===
document.getElementById('addForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('domainName').value.trim();
  const expiry = document.getElementById('expiryDate').value.trim();
  const status = "Active";

  if(!name || !expiry) return alert("Please enter domain name and expiry date");

  // 1. Save to localStorage
  const list = loadData();
  list.push({clientName: "MockClient", domainName: name, expiryDate: expiry, email:"tippzcashtraders@gmail.com", whatsapp:"", notificationSent:false});
  saveData(list);

  // 2. Render immediately
  const container = document.getElementById('domains-container');
  const card = document.createElement('div');
  card.className = 'domain-card';
  card.innerHTML = `<h3>${name}</h3><p>Expiry: ${expiry}</p><p>Status: ${status}</p>`;
  container.appendChild(card);

  // 3. Send EmailJS notification
  emailjs.send("service_xxx", "template_xxx", {
    to_email: "tippzcashtraders@gmail.com",
    domain_name: name,
    expiry_date: expiry,
    status: status
  }).then(
    (res)=>console.log("Email sent!", res.status),
    (err)=>console.error("Email failed", err)
  );

  this.reset();
});

