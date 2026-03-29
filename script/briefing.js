// briefing.js
import { db } from "../firebase/config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let score = 0;
  
function formatDateBR(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

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
  const kpi = document.getElementById("kpi").value;
  const product = document.getElementById("product").value;
  const description = document.getElementById("description").value;
  const audience = document.getElementById("audience").value;
  const age = parseInt(document.getElementById("age").value);
  const location = document.getElementById("location").value;
  const deadline = document.getElementById("deadline").value;
  const deadlineDateObj = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const references = document.getElementById("references").value;
  const notes = document.getElementById("notes").value;
  const warningBox = document.getElementById("deadlineWarning");
  const scoreWarnig = document.getElementById("scoreWarnig");

  score = 0; // Resetar pontuação a cada geração

  if (age && (isNaN(age) || age < 0 || age > 120)) {
    alert("Por favor, insira uma idade média válida entre 0 e 120.");
    return;
  }

  if (deadlineDateObj < today) {
    alert("O prazo não pode ser uma data passada.");
    return;
  }

  if (!goal || !kpi || !product || !audience || !deadline) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  // 🎯 1. Objetivo + KPI (até 2)
  if (goal) score += 1;
  if (kpi) score += 1;

  // 📦 2. Produto + descrição (até 2)
  if (product) score += 1;
  if (description && description.length > 10) score += 1;

  // 👥 3. Público (até 3)
  if (audience && audience.length > 5) score += 1;

  // idade
  if (!isNaN(age) && age > 0) score += 0.5;

  // localização (inteligente)
  if (location) {
    if (location.toLowerCase().includes("brasil")) score += 0.5;
    if (location.includes("-")) score += 0.5; // ex: SP
    if (location.split(" ").length >= 2) score += 0.5; // cidade + estado
  }

  // ⏱️ 4. Prazo (até 1)
  if (deadline) score += 1;

  // 🎨 5. Referências + notas (até 2)
  if (references && references.length > 5) score += 1;
  if (notes && notes.length > 10) score += 1;

  // 🔢 limitar máximo
  if (score > 10) score = 10;

  const summary = `
    Você quer criar uma campanha com o objetivo de <b>${goal}</b>, 
    buscando principalmente <b>${kpi}</b>.<br><br>

    O foco será promover <b>${product}</b>${
      description ? `, que é ${description}` : ""
    }.<br><br>

    O público que você deseja atingir é <b>${audience}</b>${
      age ? `, com idade média de ${age} anos` : ""
    }${
      location ? `, localizado em ${location}` : ""
    }.<br><br>

    O prazo para entrega é até <b>${formatDateBR(deadline)}</b>.<br><br>

    ${
      references
        ? `Você indicou algumas referências como base: <br><b>${references}</b>.<br><br>`
        : ""
    }

    ${
      notes
        ? `Observações adicionais importantes: <br><b>${notes}</b>.<br><br>`
        : ""
    }

    Esse é o resumo do que você precisa. Está correto?
  `;
  
  const [year, month, day] = deadline.split("-");
  const deadlineDate = new Date(year, month - 1, day);

  const diffDays = (deadlineDate - today) / (1000 * 60 * 60 * 24);


  if(diffDays <= 2) {
    warningBox.innerText = "⚠️ Atenção: O prazo é muito curto e pode impactar a qualidade do trabalho!";
    warningBox.classList.remove("hidden");
  } else {
    warningBox.classList.add("hidden");
  }

  const confirmbtn = document.getElementById("confirmBtn");
  
  if(score <= 7) {
    scoreWarnig.innerText = "⚠️ A qualidade está baixa. Nota mínima 8/10.";
    confirmbtn.disabled = true;
    scoreWarnig.classList.remove("hidden");
  } else {
    confirmbtn.disabled = false;
    scoreWarnig.classList.add("hidden");
  }

  document.getElementById("summaryText").innerHTML = summary;
  document.getElementById("form").classList.add("hidden");
  document.getElementById("summary").classList.remove("hidden");

  // Feedback inteligente
  let feedback = "";

  let breakdown = `
    <br><br><b>Como calculamos:</b><br>
    • Objetivo e resultado<br>
    • Clareza do produto<br>
    • Definição do público<br>
    • Prazo definido<br>
    • Referências e contexto
  `;

  if (score <= 4) {
    feedback = "Seu briefing ainda está incompleto. Tente adicionar mais detalhes para evitar retrabalho.";
  } else if (score <= 7) {
    feedback = "Seu briefing está bom, mas pode melhorar com mais contexto e referências.";
  } else  if(score <= 9) {
    feedback = "Ótimo briefing! Informações bem estruturadas e claras.";
  } else {
    feedback = "Briefing excelente! Informações claras e completas.";
  }

  // 🔥 Exibir na tela
  document.getElementById("scoreBox").innerHTML = `
    <b>Qualidade do briefing: ${score}/10</b><br>
    ${feedback}
    ${breakdown}
  `;
}

let isSubmitting = false;

async function confirm() {
  if (isSubmitting) return; // Evita múltiplos cliques
  isSubmitting = true;

  const confirmbtn = document.getElementById("confirmBtn");
  confirmbtn.disabled = true;
  confirmbtn.innerText = "Salvando...";

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("Erro: ID do briefing não encontrado na URL.");
    isSubmitting = false;
    confirmbtn.disabled = false;
    return;
  }

  const deadlineInput = document.getElementById("deadline").value;

  const principalData = {
    product: document.getElementById("product").value,
    deadline: deadlineInput
  };

  const detailData = {
    goal: document.getElementById("goal").value,
    kpi: document.getElementById("kpi").value,
    product: document.getElementById("product").value,
    description: document.getElementById("description").value,
    audience: document.getElementById("audience").value,
    age: document.getElementById("age").value,
    location: document.getElementById("location").value,
    deadline: document.getElementById("deadline").value,
    references: document.getElementById("references").value,
    notes: document.getElementById("notes").value,
    createdAt: new Date().toISOString()
  };

  try{
    await setDoc(doc(db, "briefings", id), principalData, {merge: true});

    await setDoc(doc(db, "briefings", id, "details", "main"), detailData, {merge: true});

    document.getElementById("summary").classList.add("hidden");
    document.getElementById("final").classList.remove("hidden");
  } catch (error) {
    console.error("Erro ao salvar briefing:", error);
    alert("Ocorreu um erro ao salvar o briefing. Tente novamente.");
    isSubmitting = false;
    confirmbtn.disabled = false;
  }

  document.getElementById("summary").classList.add("hidden");
  document.getElementById("final").classList.remove("hidden");
}

function edit() {
    document.getElementById("summary").classList.add("hidden");
    document.getElementById("form").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("deadline").setAttribute("min", today);
  document.getElementById("startBtn").addEventListener("click", start);
  document.getElementById("generateSummaryBtn").addEventListener("click", generateSummary);
  document.getElementById("confirmBtn").addEventListener("click", confirm);
  document.getElementById("editBtn").addEventListener("click", edit);
});