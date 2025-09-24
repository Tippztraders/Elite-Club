// ===== CONFIG =====
const STORAGE_KEY = 'elite_domains_v1';

// Init EmailJS (replace with your own public key)
(function() {
  emailjs.init("YOUR_PUBLIC_KEY"); 
})();

// Load data
function loadData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){
    console.error("Parse error", e);
    return [];
  }
}

// Save data
function saveData(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Days between
function daysBetween(dateA, dateB){
  const msPerDay = 24*60*60*1000;
  const a = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const b = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.round((a - b)/msPerDay);
}

// Render table
function render(){
  const tbody = document.getElementById("domainTableBody");
  tbody.innerHTML = "";
  const list = loadData();
  const today = new Date();

  list.forEach((item, idx)=>{
    const expiry = new Date(item.expiryDate);
    const daysLeft = daysBetween(expiry, today);

    let statusText = "OK";
    let rowClass = "";
    if(daysLeft < 0){ statusText = "Expired"; rowClass = "bg-red-100"; }
    else if(item.notificationSent){ statusText = `Reminder sent (${item.sentOn || 'unknown'})`; rowClass = "bg-gray-50"; }
    else if(daysLeft <= 30){ statusText = "Urgent (<30)"; rowClass = "bg-red-200"; }
    else if(daysLeft <= 90){ statusText = "Upcoming (<=90)"; rowClass = "bg-yellow-100"; }

    const tr = document.createElement("tr");
    tr.className = rowClass;
    tr.innerHTML = `
      <td class="p-2">${item.clientName}</td>
      <td class="p-2">${item.domainName}</td>
      <td class="p-2">${item.expiryDate}</td>
      <td class="p-2">${daysLeft}</td>
      <td class="p-2">${statusText}</td>
      <td class="p-2">
        <button data-idx="${idx}" class="deleteBtn text-red-600">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// Add domain
document.getElementById("addForm").addEventListener("submit", function(e){
  e.preventDefault();
  const clientName = document.getElementById("clientName").value.trim();
  const domainName = document.getElementById("domainName").value.trim();
  const expiryDate = document.getElementById("expiryDate").value;
  const email = document.getElementById("email").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();

  if(!clientName || !domainName || !expiryDate) return alert("Please fill client, domain and expiry");

  const list = loadData();
  list.push({clientName, domainName, expiryDate, email, whatsapp, notificationSent:false});
  saveData(list);
  this.reset();
  render();
});

// Delete
document.getElementById("domainTableBody").addEventListener("click", function(e){
  if(e.target.classList.contains("deleteBtn")){
    const idx = Number(e.target.dataset.idx);
    const list = loadData();
    list.splice(idx,1);
    saveData(list);
    render();
  }
});

// Scan + email
function scanAndMark(){
  const list = loadData();
  const today = new Date();
  const reminders = [];

  list.forEach(item=>{
    if(item.notificationSent) return;
    const expiry = new Date(item.expiryDate);
    const daysLeft = daysBetween(expiry, today);

    if(daysLeft === 90){
      item.notificationSent = true;
      item.sentOn = today.toISOString().slice(0,10);
      reminders.push(item);

      // Send email via EmailJS
      emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        client_name: item.clientName,
        domain_name: item.domainName,
        expiry_date: item.expiryDate,
        to_email: item.email
      }).then(()=>{
        console.log("Email sent to", item.email);
      }).catch(err=>{
        console.error("Email failed", err);
      });
    }
  });

  if(reminders.length) saveData(list);
  render();
  return reminders;
}

// Buttons
document.getElementById("scanNow").addEventListener("click", scanAndMark);
document.getElementById("clearAll").addEventListener("click", ()=>{
  if(confirm("Clear all?")) localStorage.removeItem(STORAGE_KEY), render();
});
document.getElementById("exportCsv").addEventListener("click", ()=>{
  const list = loadData();
  const csv = ["clientName,domainName,expiryDate,email,whatsapp,notificationSent,sentOn"];
  list.forEach(r=>{
    csv.push([r.clientName,r.domainName,r.expiryDate,r.email,r.whatsapp,r.notificationSent ? "1":"0",r.sentOn||""].join(","));
  });
  const blob = new Blob([csv.join("\n")], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "domains-backup.csv";
  a.click(); a.remove();
});

// Auto-scan on load
window.addEventListener("load", ()=>{
  render();
  scanAndMark();
});
// ===== CONFIG =====
const STORAGE_KEY = 'elite_domains_v1';

// Init EmailJS (replace with your own public key)
(function() {
  emailjs.init("YOUR_PUBLIC_KEY"); 
})();

// Load data
function loadData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){
    console.error("Parse error", e);
    return [];
  }
}

// Save data
function saveData(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Days between
function daysBetween(dateA, dateB){
  const msPerDay = 24*60*60*1000;
  const a = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const b = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.round((a - b)/msPerDay);
}

// Render table
function render(){
  const tbody = document.getElementById("domainTableBody");
  tbody.innerHTML = "";
  const list = loadData();
  const today = new Date();

  list.forEach((item, idx)=>{
    const expiry = new Date(item.expiryDate);
    const daysLeft = daysBetween(expiry, today);

    let statusText = "OK";
    let rowClass = "";
    if(daysLeft < 0){ statusText = "Expired"; rowClass = "bg-red-100"; }
    else if(item.notificationSent){ statusText = `Reminder sent (${item.sentOn || 'unknown'})`; rowClass = "bg-gray-50"; }
    else if(daysLeft <= 30){ statusText = "Urgent (<30)"; rowClass = "bg-red-200"; }
    else if(daysLeft <= 90){ statusText = "Upcoming (<=90)"; rowClass = "bg-yellow-100"; }

    const tr = document.createElement("tr");
    tr.className = rowClass;
    tr.innerHTML = `
      <td class="p-2">${item.clientName}</td>
      <td class="p-2">${item.domainName}</td>
      <td class="p-2">${item.expiryDate}</td>
      <td class="p-2">${daysLeft}</td>
      <td class="p-2">${statusText}</td>
      <td class="p-2">
        <button data-idx="${idx}" class="deleteBtn text-red-600">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// Add domain
document.getElementById("addForm").addEventListener("submit", function(e){
  e.preventDefault();
  const clientName = document.getElementById("clientName").value.trim();
  const domainName = document.getElementById("domainName").value.trim();
  const expiryDate = document.getElementById("expiryDate").value;
  const email = document.getElementById("email").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();

  if(!clientName || !domainName || !expiryDate) return alert("Please fill client, domain and expiry");

  const list = loadData();
  list.push({clientName, domainName, expiryDate, email, whatsapp, notificationSent:false});
  saveData(list);
  this.reset();
  render();
});

// Delete
document.getElementById("domainTableBody").addEventListener("click", function(e){
  if(e.target.classList.contains("deleteBtn")){
    const idx = Number(e.target.dataset.idx);
    const list = loadData();
    list.splice(idx,1);
    saveData(list);
    render();
  }
});

// Scan + email
function scanAndMark(){
  const list = loadData();
  const today = new Date();
  const reminders = [];

  list.forEach(item=>{
    if(item.notificationSent) return;
    const expiry = new Date(item.expiryDate);
    const daysLeft = daysBetween(expiry, today);

    if(daysLeft === 90){
      item.notificationSent = true;
      item.sentOn = today.toISOString().slice(0,10);
      reminders.push(item);

      // Send email via EmailJS
      emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        client_name: item.clientName,
        domain_name: item.domainName,
        expiry_date: item.expiryDate,
        to_email: item.email
      }).then(()=>{
        console.log("Email sent to", item.email);
      }).catch(err=>{
        console.error("Email failed", err);
      });
    }
  });

  if(reminders.length) saveData(list);
  render();
  return reminders;
}

// Buttons
document.getElementById("scanNow").addEventListener("click", scanAndMark);
document.getElementById("clearAll").addEventListener("click", ()=>{
  if(confirm("Clear all?")) localStorage.removeItem(STORAGE_KEY), render();
});
document.getElementById("exportCsv").addEventListener("click", ()=>{
  const list = loadData();
  const csv = ["clientName,domainName,expiryDate,email,whatsapp,notificationSent,sentOn"];
  list.forEach(r=>{
    csv.push([r.clientName,r.domainName,r.expiryDate,r.email,r.whatsapp,r.notificationSent ? "1":"0",r.sentOn||""].join(","));
  });
  const blob = new Blob([csv.join("\n")], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "domains-backup.csv";
  a.click(); a.remove();
});





// === NEW: Fetch domains from JSON file ===
fetch('domains.json')
  .then(response => response.json())
  .then(domains => {
    const container = document.getElementById('domains-container');
    container.innerHTML = ''; // clear placeholder text

    domains.forEach(domain => {
      const card = document.createElement('div');
      card.className = 'domain-card';
      card.innerHTML = `
        <h3>${domain.name}</h3>
        <p>Expiry: ${domain.expiry}</p>
        <p>Status: ${domain.status}</p>
      `;
      container.appendChild(card);
    });
  })
  .catch(error => console.error('Error loading domains:', error));


// Auto-scan on load
window.addEventListener("load", ()=>{
  render();
  scanAndMark();
});




// === NEW: Handle Add Domain button ===
document.getElementById('add-domain').addEventListener('click', () => {
  const name = prompt("Enter domain name:");
  const expiry = prompt("Enter expiry date (YYYY-MM-DD):");
  const status = "Active"; // default

  if (name && expiry) {
    const container = document.getElementById('domains-container');

    const card = document.createElement('div');
    card.className = 'domain-card';
    card.innerHTML = `
      <h3>${name}</h3>
      <p>Expiry: ${expiry}</p>
      <p>Status: ${status}</p>
    `;

    container.appendChild(card);

    // === NEW: Send EmailJS notification (mock IDs) ===
    emailjs.send("service_xxx", "template_xxx", {
      to_email: "tippzcashtraders@gmail.com",
      domain_name: name,
      expiry_date: expiry,
      status: status
    }).then(
      (response) => {
        console.log("Email sent!", response.status, response.text);
      },
      (error) => {
        console.error("Email failed...", error);
      }
    );
  }
});



// === NEW: Daily expiry check ===
function checkExpiringDomains(domains) {
  const today = new Date();

  domains.forEach(domain => {
    const expiryDate = new Date(domain.expiry);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      // Send expiry reminder
      emailjs.send("service_xxx", "template_xxx", {
        to_email: "tippzcashtraders@gmail.com",
        domain_name: domain.name,
        expiry_date: domain.expiry,
        status: domain.status
      }).then(
        (response) => console.log("Reminder sent for", domain.name),
        (error) => console.error("Reminder failed...", error)
      );
    }
  });
}

// Hook into existing fetch
fetch('domains.json')
  .then(response => response.json())
  .then(domains => {
    // existing rendering code runs...
    checkExpiringDomains(domains); // <--- NEW CALL
  });



