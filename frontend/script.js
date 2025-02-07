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

// Display tasks in the task list view
function displayTasks(tasks) {
  const taskList = document.getElementById("tasks");
  taskList.innerHTML = ""; // Clear existing tasks

  if (tasks.length === 0) {
    taskList.innerHTML = "<li>No tasks available.</li>";
  } else {
    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.textContent = `${task.title} - ${task.status}`;
      taskList.appendChild(li);
    });
  }
}

// Initialize the page by fetching tasks
fetchTasks();

