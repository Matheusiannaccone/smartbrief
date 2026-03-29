// index.js
import { db } from "../firebase/config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById("generateLink").onclick = generateLink;
document.getElementById("copyLink").onclick = copyLink;

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
}

async function loadBriefings() {
  const querySnapshot = await getDocs(collection(db, "briefings"));

  let briefings = [];

  querySnapshot.forEach((doc) => {
    briefings.push({
      id: doc.id,
      ...doc.data()
    });
  });

  // 🔥 Ordenar por prazo (mais urgente primeiro)
  briefings.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const list = document.getElementById("list");
  list.innerHTML = "";

  briefings.forEach((b) => {
    const button = document.createElement("button");

    button.className = "briefing-button";

    button.innerHTML = `
      <strong>${b.product}</strong><br>
      Objetivo: ${b.goal}<br>
      Prazo: ${b.deadline}
    `;

    button.onclick = () => {
      window.location.href = `details.html?id=${b.id}`;
    };

    list.appendChild(button);
  });
}

function generateId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateLink() {
    const id = generateId();
    const link = `${window.location.origin}/briefing.html?id=${id}`;
    document.getElementById("link").value = link;
}

function copyLink() {
    const input = document.getElementById("link");
    input.select();
    document.execCommand("copy");
    alert("Link copiado!");
}


loadBriefings();