// briefing.js
import { db } from "../firebase/config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function start() {
    document.getElementById("start").classList.add("hidden");
    document.getElementById("form").classList.remove("hidden");
  }

function generateSummary() {
    const goal = document.getElementById("goal").value;
    const product = document.getElementById("product").value;
    const audience = document.getElementById("audience").value;
    const deadline = document.getElementById("deadline").value;
    const notes = document.getElementById("notes").value;

    if (!goal || !product || !audience || !deadline) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const summary = `
      Você deseja criar uma campanha com foco em <b>${goal}</b>, 
      promovendo <b>${product}</b>, para o público <b>${audience}</b>, 
      com prazo até <b>${deadline}</b>.
      ${notes ? "<br><br>Observações adicionais: " + notes : ""}
    `;

    document.getElementById("summaryText").innerHTML = summary;

    document.getElementById("form").classList.add("hidden");
    document.getElementById("summary").classList.remove("hidden");
}

async function confirm() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const data = {
    goal: document.getElementById("goal").value,
    product: document.getElementById("product").value,
    audience: document.getElementById("audience").value,
    deadline: document.getElementById("deadline").value,
    notes: document.getElementById("notes").value,
    createdAt: new Date().toISOString()
  };

  if (!id) {
    alert("Erro: ID do briefing não encontrado na URL.");
    return;
  }
  await setDoc(doc(db, "briefings", id), data);

  document.getElementById("summary").classList.add("hidden");
  document.getElementById("final").classList.remove("hidden");
}

function edit() {
    document.getElementById("summary").classList.add("hidden");
    document.getElementById("form").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", start);
  document.getElementById("generateSummaryBtn").addEventListener("click", generateSummary);
  document.getElementById("confirmBtn").addEventListener("click", confirm);
  document.getElementById("editBtn").addEventListener("click", edit);
});