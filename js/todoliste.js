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
        const li = document.createElement("li");
        li.className = `list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 ${getBadgeClass(todo.status)}`;

        const content = document.createElement("div");
        content.classList.add("flex-grow-1");
        content.innerHTML = `<strong>${todo.title}</strong><br><small>${todo.date || ""} ${todo.time || ""}</small>`;

        const actions = document.createElement("div");
        actions.className = "d-flex flex-wrap gap-1";

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "btn btn-sm btn-outline-success";
        toggleBtn.innerHTML = todo.status === "done" ? "✔" : "✓";
        toggleBtn.title = "Terminé / À faire";
        toggleBtn.onclick = () => toggleTodoStatus(todo);

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-outline-warning";
        editBtn.innerHTML = "✎";
        editBtn.title = "Modifier";
        editBtn.onclick = () => fillFormForEdit(todo);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-outline-danger";
        deleteBtn.innerHTML = "🗑";
        deleteBtn.title = "Supprimer";
        deleteBtn.onclick = () => deleteTodo(todo.id);

        actions.append(toggleBtn, editBtn, deleteBtn);
        li.append(content, actions);
        list.appendChild(li);
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
