// To Do List App - Makos Tech
// Yellow & Black Theme

const formEl = document.querySelector(".form");
const inputEl = document.querySelector(".input");
const ulEl = document.querySelector(".list");

// Load saved tasks from localStorage
let list = JSON.parse(localStorage.getItem("list"));
if (list) {
  list.forEach((task) => toDoList(task));
}

// Handle form submission
formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  toDoList();
});

// Create and display task
function toDoList(task) {
  let newTask = inputEl.value;
  if (task) newTask = task.name;

  const liEl = document.createElement("li");
  if (task && task.checked) liEl.classList.add("checked");
  liEl.innerText = newTask;
  ulEl.appendChild(liEl);
  inputEl.value = "";

  // Add check button
  const checkBtnEl = document.createElement("div");
  checkBtnEl.innerHTML = `<i class="fas fa-check-square"></i>`;
  liEl.appendChild(checkBtnEl);

  // Add delete button
  const trashBtnEl = document.createElement("div");
  trashBtnEl.innerHTML = `<i class="fas fa-trash"></i>`;
  liEl.appendChild(trashBtnEl);

  // Toggle task completion
  checkBtnEl.addEventListener("click", () => {
    liEl.classList.toggle("checked");
    updateLocalStorage();
  });

  // Delete task
  trashBtnEl.addEventListener("click", () => {
    liEl.remove();
    updateLocalStorage();
  });

  updateLocalStorage();
}

// Save tasks to localStorage
function updateLocalStorage() {
  const liEls = document.querySelectorAll("li");
  list = [];
  liEls.forEach((liEl) => {
    list.push({
      name: liEl.innerText,
      checked: liEl.classList.contains("checked"),
    });
  });
  localStorage.setItem("list", JSON.stringify(list));
}
