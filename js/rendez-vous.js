document.addEventListener("DOMContentLoaded", () => {
  const btnAdd = document.getElementById("add-rdv-btn");
  const modal = new bootstrap.Modal(document.getElementById("rdvModal"));
  const form = document.getElementById("rdv-form");
  const rdvList = document.getElementById("rendezvous-list");

  let rendezVous = JSON.parse(localStorage.getItem("rendezVous")) || [];

  const renderList = () => {
    rdvList.innerHTML = "";

    if (rendezVous.length === 0) {
      rdvList.innerHTML = `<div class="text-center text-muted">Aucun rendez-vous pour le moment.</div>`;
      return;
    }

    rendezVous.forEach((rdv, index) => {
      const item = document.createElement("div");
      item.className = "list-group-item d-flex justify-content-between align-items-center";

      item.innerHTML = `
        <div>
          <h5 class="mb-1">${rdv.titre}</h5>
          <small>${rdv.date} à ${rdv.heure}</small>
        </div>
        <button class="btn btn-sm btn-outline-danger" data-index="${index}">Supprimer</button>
      `;

      item.querySelector("button").addEventListener("click", () => {
        rendezVous.splice(index, 1);
        localStorage.setItem("rendezVous", JSON.stringify(rendezVous));
        renderList();
      });

      rdvList.appendChild(item);
    });
  };

  btnAdd.addEventListener("click", () => {
    form.reset();
    modal.show();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const titre = document.getElementById("titre").value;
    const date = document.getElementById("date").value;
    const heure = document.getElementById("heure").value;

    rendezVous.push({ titre, date, heure });
    localStorage.setItem("rendezVous", JSON.stringify(rendezVous));
    renderList();
    modal.hide();
  });

  renderList();
});
