document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-text");
  const statusSelect = document.getElementById("todo-status");
  const dateInput = document.getElementById("todo-date");
  const timeInput = document.getElementById("todo-time");
  const list = document.getElementById("todo-list");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let todos = JSON.parse(localStorage.getItem("todos")) || [];
  let currentFilter = "all";

  function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
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
      .forEach((todo, index) => {
        const li = document.createElement("li");
        li.className = `list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 ${getBadgeClass(todo.status)}`;

        const content = document.createElement("div");
        content.classList.add("flex-grow-1");
        content.innerHTML = `
          <strong>${todo.text}</strong><br>
          <small>${todo.date || ""} ${todo.time || ""}</small>
        `;

        const actions = document.createElement("div");
        actions.className = "d-flex flex-wrap gap-1";

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "btn btn-sm btn-outline-success";
        toggleBtn.innerHTML = todo.status === "done" ? "✔" : "✓";
        toggleBtn.title = "Terminé / À faire";
        toggleBtn.onclick = () => {
          todos[index].status = todos[index].status === "done" ? "todo" : "done";
          saveTodos();
          renderTodos();
        };

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-outline-warning";
        editBtn.innerHTML = "✎";
        editBtn.title = "Modifier";
        editBtn.onclick = () => {
          input.value = todo.text;
          statusSelect.value = todo.status === "done" ? "todo" : todo.status;
          dateInput.value = todo.date || "";
          timeInput.value = todo.time || "";
          todos.splice(index, 1);
          saveTodos();
          renderTodos();
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-outline-danger";
        deleteBtn.innerHTML = "🗑";
        deleteBtn.title = "Supprimer";
        deleteBtn.onclick = () => {
          todos.splice(index, 1);
          saveTodos();
          renderTodos();
        };

        actions.append(toggleBtn, editBtn, deleteBtn);
        li.append(content, actions);
        list.appendChild(li);
      });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    todos.push({
      text,
      status: statusSelect.value || "todo",
      date: dateInput.value,
      time: timeInput.value,
    });

    saveTodos();
    form.reset();
    renderTodos();
  });

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTodos();
    });
  });

  renderTodos();
});
