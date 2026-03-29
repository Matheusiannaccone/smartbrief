import { db } from "../firebase/config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const content = document.getElementById("content");

  if (!id) {
    content.innerHTML = "<p>ID do briefing não encontrado.</p>";
    return;
  }

  try {
    const docRef = doc(db, "briefings", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      content.innerHTML = `
        <p><span class="label">Objetivo:</span> ${data.goal}</p>
        <p><span class="label">Produto:</span> ${data.product}</p>
        <p><span class="label">Público-alvo:</span> ${data.audience}</p>
        <p><span class="label">Prazo:</span> ${formatDate(data.deadline)}</p>
        <p><span class="label">Observações:</span> ${data.notes || "Nenhuma"}</p>
      `;
    } else {
      content.innerHTML = "<p>Briefing não encontrado.</p>";
    }
  } catch (error) {
    content.innerHTML = "<p>Erro ao carregar briefing.</p>";
    console.error(error);
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
}

function goBack() {
  window.location.href = "index.html";
}

// Tornar função acessível ao HTML
window.goBack = goBack;

// Inicializar
loadDetails();