const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter");

let tasks = JSON.parse(localStorage.getItem("taskflow-tasks") || "[]");
let currentFilter = "all";

const today = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());
document.getElementById("todayLabel").textContent =
  today.charAt(0).toUpperCase() + today.slice(1);

function saveTasks() {
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

function addTask(title) {
  tasks.unshift({
    id: Date.now(),
    title: title.trim(),
    completed: false,
  });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  taskList.replaceChildren();
  filteredTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const check = document.createElement("button");
    check.className = "check-btn";
    check.type = "button";
    check.setAttribute(
      "aria-label",
      task.completed ? "Marquer comme à faire" : "Marquer comme terminée",
    );
    check.textContent = task.completed ? "✓" : "";
    check.addEventListener("click", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "task-text";
    title.textContent = task.title;

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.type = "button";
    remove.setAttribute("aria-label", "Supprimer la tâche");
    remove.textContent = "×";
    remove.addEventListener("click", () => deleteTask(task.id));

    item.append(check, title, remove);
    taskList.appendChild(item);
  });

  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const remaining = total - completed;
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("doneCount").textContent = completed;
  document.getElementById("leftCount").textContent = remaining;
  document.getElementById("taskCounter").textContent =
    `${total} tâche${total > 1 ? "s" : ""}`;
  document.getElementById("progressText").textContent = `${percentage}%`;
  document.getElementById("progressBar").style.width = `${percentage}%`;

  emptyState.hidden = filteredTasks.length !== 0;
  taskList.hidden = filteredTasks.length === 0;
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  addTask(title);
  taskInput.value = "";
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) =>
      item.classList.toggle("active", item === button),
    );
    renderTasks();
  });
});

document.getElementById("clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
