// Toggle views
const taskListView = document.getElementById("task-list");
const calendarView = document.getElementById("calendar-view");
document.getElementById("view-tasks").addEventListener("click", () => {
  taskListView.classList.remove("hidden");
  calendarView.classList.add("hidden");
  fetchTasks(); // Fetch tasks whenever Task List is clicked
});
document.getElementById("view-calendar").addEventListener("click", () => {
  calendarView.classList.remove("hidden");
  taskListView.classList.add("hidden");
});

// Fetch tasks from Flask backend
async function fetchTasks() {
  try {
    console.log ("Fetching tasks...");
    const response = await fetch("http://127.0.0.1:5000/tasks");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const tasks = await response.json();
    console.log("tasls fetched:", tasks)
    displayTasks(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    alert("Failed to fetch tasks. Please check the console for details.");
  }
}

function displayTasks(tasks) {
  const taskList = document.getElementById("tasks");
  taskList.innerHTML = ""; // Clear existing tasks

  if (tasks.length === 0) {
    taskList.innerHTML = "<li>No tasks available.</li>";
  } else {
    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.textContent = `${task.title} - ${task.status}`;
      li.className = "task-item";
      li.setAttribute("data-id", task.id);
      li.classList.add("task-item");
      li.setAttribute("draggable", "true");

      // Edit Button
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.onclick = () => editTask(task.id);

      // Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteTask(task.id);

      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });
    initializeDragAndDrop();
  }
}

// Add a new task
async function addTask() {
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;

  if (!title.trim()) {
    alert("Task title is required!");
    return;
  }
  const newTask = { title, description };
  await fetch("http://127.0.0.1:5000/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  });
  fetchTasks();  // Refresh the task list
}
 // Clear input fields and refresh task list
 document.getElementById("task-title").value = "";
 document.getElementById("task-description").value = "";
 fetchTasks();

// Edit an existing task
async function editTask(taskId) {
  const newTitle = prompt("Enter new title:");
  if (newTitle) {
    await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    fetchTasks();
  }
}

// Delete a task
async function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
      method: "DELETE",
    });
    fetchTasks();
  }
}

// Drag-and-Drop Functions
// Drag-and-Drop Functionality
function initializeDragAndDrop() {
  const taskList = document.getElementById("tasks");
  let draggedElement = null;

  taskList.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("task-item")) {
      draggedElement = e.target;
      e.target.classList.add("dragging");
    }
  });

  taskList.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("task-item")) {
      e.target.classList.remove("dragging");
    }
  });

  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (afterElement == null) {
      taskList.appendChild(draggedElement);
    } else {
      taskList.insertBefore(draggedElement, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-item:not(.dragging)"),
  ];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}



// Initialize the page by fetching tasks
fetchTasks();
