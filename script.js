// ===== STORAGE & UTIL =====
const STORAGE_KEY = 'domains';
function getDomains() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
function saveDomains(domains) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(domains));
  renderDomains();
}
function daysBetween(dateA, dateB){
  const msPerDay = 24*60*60*1000;
  return Math.round((Date.UTC(dateA.getFullYear(),dateA.getMonth(),dateA.getDate()) -
                     Date.UTC(dateB.getFullYear(),dateB.getMonth(),dateB.getDate()))/msPerDay);
}

// ===== INIT EMAILJS =====
(function(){ emailjs.init("YOUR_PUBLIC_KEY"); })();

// ===== RENDER TABLE & CARDS =====
function renderDomains(){
  const tbody = document.querySelector("#domainTable tbody");
  tbody.innerHTML = "";
  const container = document.getElementById('domains-container');
  container.innerHTML = "";
  getDomains().forEach((d, idx)=>{
    // Table row
    const tr = document.createElement("tr");
    const today = new Date();
    const expDate = new Date(d.expiryDate || d.expiry);
    const daysLeft = daysBetween(expDate, today);
    let statusText = "OK";
    if(daysLeft < 0) statusText = "Expired";
    else if(daysLeft <= 30) statusText = "Urgent (<30)";
    else if(daysLeft <= 90) statusText = "Upcoming (<=90)";
    tr.innerHTML = `
      <td>${d.clientName||"N/A"}</td>
      <td>${d.domainName||d.name}</td>
      <td>${d.expiryDate||d.expiry}</td>
      <td>${daysLeft}</td>
      <td>${statusText}</td>
      <td><button onclick="deleteDomain(${idx})">Delete</button></td>
    `;
    tbody.appendChild(tr);

    // Card view
    const card = document.createElement("div");
    card.className = 'domain-card';
    card.innerHTML = `
      <h3>${d.domainName||d.name}</h3>
      <p>Expiry: ${d.expiryDate||d.expiry}</p>
      <p>Status: ${statusText}</p>
    `;
    container.appendChild(card);
  });
}

// ===== ADD DOMAIN =====
document.querySelector("#addForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  const name = document.querySelector("#domainName").value.trim();
  const expiry = document.querySelector("#expiryDate").value.trim();
  if(!name || !expiry) return alert("Please enter domain name and expiry");
  const list = getDomains();
  list.push({
    clientName:"MockClient",
    domainName: name,
    expiryDate: expiry,
    email: "tippzcashtraders@gmail.com",
    whatsapp:"",
    notificationSent:false
  });
  saveDomains(list);

  // Send EmailJS notification
  emailjs.send("service_xxx", "template_xxx", {
    to_email:"tippzcashtraders@gmail.com",
    domain_name:name,
    expiry_date:expiry,
    status:"Active"
  }).then(res=>console.log("Email sent!", res.status),
          err=>console.error("Email failed", err));

  e.target.reset();
});

// ===== DELETE =====
function deleteDomain(idx){
  const list = getDomains();
  list.splice(idx,1);
  saveDomains(list);
}

// ===== EXPORT CSV =====
function exportCsv(){
  const rows = [["Client","Domain","Expiry","Email","WhatsApp","Notified","SentOn"],
                ...getDomains().map(d=>[d.clientName||"N/A",d.domainName||d.name,d.expiryDate||d.expiry,d.email||"",d.whatsapp||"",d.notificationSent?"1":"0",d.sentOn||""])];
  const csv = rows.map(r=>r.join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "domains.csv";
  a.click();
}

// ===== DAILY EXPIRY CHECK =====
function dailyExpiryCheck(){
  const list = getDomains();
  const today = new Date();
  list.forEach(d=>{
    if(d.notificationSent) return;
    const expiry = new Date(d.expiryDate||d.expiry);
    const diffDays = Math.ceil((expiry - today)/(1000*60*60*24));
    if(diffDays <= 1){
      emailjs.send("service_xxx","template_xxx",{
        to_email:d.email||"tippzcashtraders@gmail.com",
        domain_name:d.domainName||d.name,
        expiry_date:d.expiryDate||d.expiry,
        status:d.status||"Active"
      }).then(res=>console.log("Reminder sent for",d.domainName||d.name),
              err=>console.error("Reminder failed",d.domainName||d.name,err));
      d.notificationSent = true;
      d.sentOn = today.toISOString().slice(0,10);
    }
  });
  saveDomains(list);
  renderDomains();
}

// ===== FETCH DOMAINS.JSON =====
fetch('domains.json')
  .then(r=>r.json())
  .then(domains=>{
    const list = getDomains();
    domains.forEach(d=>{
      // only add if not already exists
      if(!list.some(x=>x.name===d.name)) list.push(d);
    });
    saveDomains(list);
    dailyExpiryCheck();
  }).catch(err=>console.error("Error loading domains.json",err));

// ===== BUTTONS =====
document.getElementById("scanNow").addEventListener("click", dailyExpiryCheck);
document.getElementById("exportCsv").addEventListener("click", exportCsv);

// ===== INIT =====
document.addEventListener("DOMContentLoaded", renderDomains);
window.addEventListener("load", dailyExpiryCheck);

// Optional: auto daily check every 24h
setInterval(dailyExpiryCheck,24*60*60*1000);
