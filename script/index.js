// index.js
import { db } from "../firebase/config.js";
import { collection, doc, getDoc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const clientInput = document.getElementById("clientName");
const responsibleInput = document.getElementById("responsibleName");
const generateLinkBtn = document.getElementById("generateLink");

const toggleBtn = document.getElementById("toggleFilters");
const filtersDiv = document.getElementById("filters");

toggleBtn.onclick = () => {
  if (filtersDiv.classList.contains("hidden")) {
    filtersDiv.classList.remove("hidden");
    toggleBtn.innerText = "Filtros ▲";
  } else {
    filtersDiv.classList.add("hidden");
    toggleBtn.innerText = "Filtros ▼";
  }
};

document.getElementById("generateLink").onclick = generateLink;
document.getElementById("copyLink").onclick = copyLink;

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function showView(viewId) {
  document.getElementById("homeView").classList.add("hidden");
  document.getElementById("detailsView").classList.add("hidden");

  document.getElementById(viewId).classList.remove("hidden");
}

function checkInputs() {
   generateLinkBtn.disabled = !(clientInput.value.trim() && responsibleInput.value.trim());
}

clientInput.addEventListener("input", checkInputs);
responsibleInput.addEventListener("input", checkInputs);

async function openDetails(id) {
  showView("detailsView");

  const docRef = doc(db, "briefings", id, "details", "main");
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();

  if (!docSnap.exists()) {
    document.getElementById("detailsContent").innerHTML = `
      <p>Briefing não encontrado.</p>
    `;
    return;
  } else if (docSnap.exists()) {
    document.getElementById("detailsContent").innerHTML = `
      <h2>Detalhes do Briefing</h2>

      <table class="briefing-table">
        <tr>
          <th>Campo</th>
          <th>Valor</th>
        </tr>

        <tr><td>Produto</td><td>${data.product || "-"}</td></tr>
        <tr><td>Objetivo</td><td>${data.goal || "-"}</td></tr>
        <tr><td>KPI</td><td>${data.kpi || "-"}</td></tr>
        <tr><td>Público</td><td>${data.audience || "-"}</td></tr>
        <tr><td>Idade</td><td>${data.age || "-"}</td></tr>
        <tr><td>Localização</td><td>${data.location || "-"}</td></tr>
        <tr><td>Prazo</td><td>${formatDate(data.deadline)}</td></tr>
        <tr><td>Descrição</td><td>${data.description || "-"}</td></tr>
        <tr><td>Referências</td><td>${data.references || "-"}</td></tr>
        <tr><td>Observações</td><td>${data.notes || "-"}</td></tr>
        <tr><td>Criado em</td><td>${new Date(data.createdAt).toLocaleString()}</td></tr>
      </table>
    `;
  }
}

document.getElementById("backBtn").onclick = () => {
  showView("homeView");
};

let allBriefings = [];

async function loadBriefings() {
  const querySnapshot = await getDocs(collection(db, "briefings"));

  allBriefings = [];

  querySnapshot.forEach((doc) => {
    allBriefings.push({
      id: doc.id,
      ...doc.data()
    });
  });

  // Ordenar por prazo (mais urgente primeiro)
  allBriefings.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  renderBriefings(allBriefings);
}

function renderBriefings(briefings) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  briefings.forEach((b) => {
    const conatiner = document.createElement("div");
    conatiner.className = "briefing-container";

    // Botão principal do briefing
    const button = document.createElement("button");
    button.className = "briefing-button";

    button.innerHTML = `
      <strong>${b.product}</strong><br>
      Cliente: ${b.client}<br>
      Responsável: ${b.responsible}<br>
      Prazo: ${b.deadline}
    `;

    button.onclick = () => openDetails(b.id);

    // Botão de link
    const linkBtn = document.createElement("button");
    linkBtn.className = "briefing-link-button";
    linkBtn.innerText = '🔗 link';
    linkBtn.title = "Copiar link do briefing";
    linkBtn.onclick = () => {
      // Copiar link para área de transferência
      const link = `${window.location.origin}/briefing.html?id=${b.id}`;
      navigator.clipboard.writeText(link);

      // Feedback visual
      linkBtn.classList.add("copy-success");
      linkBtn.innerText = "Copiado!";

      setTimeout(() => {
        linkBtn.classList.remove("copy-success");
        linkBtn.innerText = '🔗 link';
      }, 3000);
    };

    conatiner.appendChild(button);
    conatiner.appendChild(linkBtn);
    list.appendChild(conatiner);
  });
}

function applyFilters() {
  const clientFilter = document.getElementById("filterClient").value.toLowerCase().trim();
  const responsibleFilter = document.getElementById("filterResponsible").value.toLowerCase().trim();
  const dateFrom = document.getElementById("filterDateFrom").value;
  const dateTo = document.getElementById("filterDateTo").value;

  const filtered = allBriefings.filter((b) => {
    let match = true;

    if (clientFilter) {
      match = match && b.client.toLowerCase().includes(clientFilter);
    }

    if (responsibleFilter) {
      match = match && b.responsible.toLowerCase().includes(responsibleFilter);
    }

    if (dateFrom || dateTo) {
      const deadline = new Date(b.deadline);
      if (dateFrom && deadline < new Date(dateFrom)) {
        match = false;
      }
      if (dateTo && deadline > new Date(dateTo)) {
        match = false;
      }
    }

    return match;
  });

  renderBriefings(filtered);
}

document.getElementById("applyFilters").onclick = applyFilters;
document.getElementById("clearFilters").onclick = () => {
  document.getElementById("filterClient").value = "";
  document.getElementById("filterResponsible").value = "";
  document.getElementById("filterDateFrom").value = "";
  document.getElementById("filterDateTo").value = "";
  renderBriefings(allBriefings);
};

function generateId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function generateLink() {
  const client = clientInput.value.trim();
  const responsible = responsibleInput.value.trim();

  if (!client || !responsible) {
    alert("Por favor, preencha os campos de Cliente e Responsável.");
    return;
  }

  const id = generateId();
  const link = `${window.location.origin}/briefing.html?id=${id}`;
  document.getElementById("link").value = link;

  const briefingData = {
    client: clientInput.value.trim(),
    responsible: responsibleInput.value.trim(),
    product: "'Não preenchido'",
    deadline: "",
    link,
    createdAt: new Date().toISOString()
  };

  try{
    await setDoc(doc(db, "briefings", id), briefingData);
    console.log("Documento principal criado com ID:", id);
  } catch (error) {
    console.error("Erro ao criar briefing:", error);
    alert("Não foi possível criar o briefing. Tente novamente.");
    return;
  }

  loadBriefings();
}

function copyLink() {
  const input = document.getElementById("link");
  const button = document.getElementById("copyLink");

  input.select();
  document.execCommand("copy");

  // Feedback visual
  button.classList.add("copy-success");
  button.innerText = "Copiado!";

  setTimeout(() => {
    button.classList.remove("copy-success");
    button.innerText = "Copiar link";
  }, 3000);
}


loadBriefings();

// 🔥 Registrar Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then((reg) => {
        console.log("Service Worker registrado:", reg.scope);
      })
      .catch((err) => {
        console.error("Erro ao registrar Service Worker:", err);
      });
  });
}