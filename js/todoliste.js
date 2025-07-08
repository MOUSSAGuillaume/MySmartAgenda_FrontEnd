document.addEventListener("DOMContentLoaded", () => {
  console.log("Script Todo chargé");

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-text");
  const statusSelect = document.getElementById("todo-status");
  const dateInput = document.getElementById("todo-date");
  const timeInput = document.getElementById("todo-time");
  const list = document.getElementById("todo-list");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const submitBtn = form.querySelector('button[type="submit"]');

  let todos = [];
  let currentFilter = "all";

  // Fonction pour changer le texte du bouton Ajouter / Modifier
  function setFormMode(editing) {
    submitBtn.textContent = editing ? "Modifier" : "Ajouter";
  }

  async function loadTodos() {
    try {
      const res = await fetch("http://localhost:8000/api/todos");
      if (!res.ok) throw new Error("Erreur chargement todos");
      todos = await res.json();
      renderTodos();
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des tâches");
    }
  }

  function getBadgeClass(status) {
    switch (status) {
      case "urgent": return "border-start border-danger border-5";
      case "done": return "bg-light text-muted text-decoration-line-through";
      case "todo": return "border-start border-info border-5";
      default: return "border-start border-secondary border-5";
    }
  }

  function renderTodos() {
    list.innerHTML = "";
    todos
      .filter(todo => currentFilter === "all" || todo.status === currentFilter)
      .forEach(todo => {
        // Grille responsive Bootstrap
        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-4";

        // Classes pour la card
        let cardClass = "card todo-card shadow-sm mb-2";
        if (todo.status === "urgent") cardClass += " urgent";
        if (todo.status === "done") cardClass += " done";

        // Card
        const card = document.createElement("div");
        card.className = cardClass;

        // Card body (structure + actions)
        card.innerHTML = `
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${sanitizeHtml(todo.title)}</h5>
          <p class="card-text mb-1">
            ${todo.date ? `<i class="bi bi-calendar-event"></i> ${todo.date}` : ""}
            ${todo.time ? `à ${todo.time}` : ""}
          </p>
          <p class="card-text mb-3">
            ${todo.status === "urgent" ? '<span class="badge bg-warning text-dark">Urgente</span>' : ""}
            ${todo.status === "todo" ? '<span class="badge bg-info text-dark">À faire</span>' : ""}
            ${todo.status === "done" ? '<span class="badge bg-success">Terminée</span>' : ""}
          </p>
          <div class="mt-auto d-flex gap-2 justify-content-end">
            <button class="btn btn-success btn-sm" title="Terminer" ${todo.status === "done" ? "disabled" : ""}>Terminer</button>
            <button class="btn btn-outline-secondary btn-sm" title="Modifier">Modifier</button>
            <button class="btn btn-outline-danger btn-sm" title="Supprimer">Supprimer</button>
          </div>
        </div>
      `;

        // Actions (avec vrais handlers)
        const [doneBtn, editBtn, delBtn] = card.querySelectorAll("button");
        doneBtn.onclick = () => toggleTodoStatus(todo);
        editBtn.onclick = () => fillFormForEdit(todo);
        delBtn.onclick = () => deleteTodo(todo.id);

        col.appendChild(card);
        list.appendChild(col);
      });
  }

  async function addTodo(todo) {
    try {
      console.log("Ajout de la tâche :", todo);
      const res = await fetch("http://localhost:8000/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "X-AUTH-TOKEN": getToken(),
        },
        body: JSON.stringify(todo),
      });
      console.log("Réponse API ajout:", res.status);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Erreur ajout tâche: ${res.status} - ${errText}`);
      }
      await loadTodos();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout de la tâche");
    }
  }

  async function updateTodo(todo) {
    try {
      console.log("Mise à jour de la tâche :", todo);
      const res = await fetch(`http://localhost:8000/api/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // "X-AUTH-TOKEN": getToken(),
        },
        body: JSON.stringify(todo),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Erreur mise à jour tâche: ${res.status} - ${errText}`);
      }
      await loadTodos();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la tâche");
    }
  }

  async function deleteTodo(id) {
    if (!confirm("Supprimer cette tâche ?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/todos/${id}`, {
        method: "DELETE",
        headers: {
          // "X-AUTH-TOKEN": getToken(),
        },
      });
      if (!res.ok) throw new Error("Erreur suppression tâche");
      await loadTodos();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la tâche");
    }
  }

  function toggleTodoStatus(todo) {
    const newStatus = todo.status === "done" ? "todo" : "done";
    updateTodo({ ...todo, status: newStatus });
  }

  function fillFormForEdit(todo) {
    input.value = todo.title;
    statusSelect.value = todo.status === "done" ? "todo" : todo.status;
    dateInput.value = todo.date || "";
    timeInput.value = todo.time || "";
    form.dataset.editId = todo.id;
    setFormMode(true);  // corrigé ici
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const title = input.value.trim();
    if (!title) return;

    const todoData = {
      title,
      status: statusSelect.value || "todo",
      date: dateInput.value,
      time: timeInput.value,
    };

    const editId = form.dataset.editId;
    if (editId) {
      updateTodo({ ...todoData, id: editId });
      delete form.dataset.editId;
    } else {
      addTodo(todoData);
    }

    form.reset();
    setFormMode(false);  // corrigé ici
  });

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTodos();
    });
  });

  setFormMode(false); // Initialement mode Ajouter
  loadTodos();
});
