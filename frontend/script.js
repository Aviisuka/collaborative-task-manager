const taskListView = document.getElementById("task-list");
const calendarView = document.getElementById("calendar-view");
const timelineView = document.getElementById("timeline-view");

document.getElementById("view-tasks").addEventListener("click", () => {
    taskListView.classList.remove("hidden");
    calendarView.classList.add("hidden");
    timelineView.classList.add("hidden");
    fetchTasks();
});

document.getElementById("view-calendar").addEventListener("click", () => {
    calendarView.classList.remove("hidden");
    taskListView.classList.add("hidden");
    timelineView.classList.add("hidden");
    fetchTasks().then((tasks) => initializeCalendar(tasks));
});

document.getElementById("view-timeline").addEventListener("click", () => {
    timelineView.classList.remove("hidden");
    taskListView.classList.add("hidden");
    calendarView.classList.add("hidden");
    fetchTasks().then((tasks) => renderTimelineChart(tasks));
});

// Fetch tasks from Flask backend
async function fetchTasks() {
    try {
        const response = await fetch("http://127.0.0.1:5000/tasks");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        console.log("Fetched tasks:", tasks); // Debugging line
        displayTasks(tasks);
        return tasks; // Ensure tasks are returned
    } catch (error) {
        console.error("Error fetching tasks:", error);
        alert("Failed to fetch tasks. Please check the console for details.");
        return []; // Return an empty array if there's an error
    }
}
function initializeDragAndDrop() {
  const taskList = document.getElementById("tasks");
  let draggedTask = null;

  taskList.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("task-item")) {
          draggedTask = e.target;
          e.target.style.opacity = "0.5";
      }
  });

  taskList.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("task-item")) {
          e.target.style.opacity = "1";
          draggedTask = null;
      }
  });

  taskList.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(taskList, e.clientY);
      const currentTask = document.querySelector(".dragging");
      if (afterElement == null) {
          taskList.appendChild(draggedTask);
      } else {
          taskList.insertBefore(draggedTask, afterElement);
      }
  });

  const getDragAfterElement = (container, y) => {
      const draggableElements = [...container.querySelectorAll(".task-item:not(.dragging)")];
      return draggableElements.reduce(
          (closest, child) => {
              const box = child.getBoundingClientRect();
              const offset = y - box.top - box.height / 2;
              if (offset < 0 && offset > closest.offset) {
                  return { offset: offset, element: child };
              } else {
                  return closest;
              }
          },
          { offset: Number.NEGATIVE_INFINITY }
      ).element;
  };
}
document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
  const startDate = document.getElementById("taskStartDate").value;
  const endDate = document.getElementById("taskEndDate").value;

  try {
      const response = await fetch("http://127.0.0.1:5000/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              title,
              description,
              startDate,
              endDate,
          }),
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Task created successfully");
      fetchTasks(); // Refresh the task list
  } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please check the console for details.");
  }
});
// Display tasks in the task list
function displayTasks(tasks) {
    const taskList = document.getElementById("tasks");
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = "<li>No tasks available.</li>";
    } else {
        tasks.forEach((task) => {
            const li = document.createElement("li");
            li.textContent = `${task.title} - ${task.status}`;
            li.className = "task-item";
            li.setAttribute("data-id", task.id);
            li.setAttribute("draggable", "true");

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.onclick = () => editTask(task.id);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteTask(task.id);

            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }initializeDragAndDrop();
}

// Edit Task
async function editTask(taskId) {
  const newTitle = prompt("Enter new title:");
  if (newTitle === null) return; // User clicked Cancel

  const newDescription = prompt("Enter new description:");
  if (newDescription === null) return; // User clicked Cancel

  if (!newTitle) {
      alert("Title cannot be empty!");
      return;
  }

  try {
      const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              title: newTitle,
              description: newDescription,
          }),
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Task updated successfully");
      fetchTasks(); // Refresh the task list
  } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please check the console for details.");
  }
}

// Delete Task
async function deleteTask(taskId) {
  const confirmDelete = confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  try {
      const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
          method: "DELETE",
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Task deleted successfully");
      fetchTasks(); // Refresh the task list
  } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please check the console for details.");
  }
}
// Update Task Status
async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Task status updated successfully");
    } catch (error) {
        console.error("Error updating task status:", error);
    }
}


// Initialize FullCalendar
function initializeCalendar(tasks) {
    console.log("Tasks for calendar:", tasks);
    const calendarEl = document.getElementById("calendar");

    const calendarTasks = tasks.map((task) => ({
        title: task.title,
        start: task.startDate,
    }));

    console.log("Calendar tasks:", calendarTasks);
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "en",
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: calendarTasks,
    });
    calendar.render();
}
document.getElementById("jump-to-today").addEventListener("click", () => {
  const today = new Date();
  timeline.setWindow(today, new Date(today.getTime() + 24 * 60 * 60 * 1000));
});

document.getElementById("jump-to-tomorrow").addEventListener("click", () => {
  const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  timeline.setWindow(tomorrow, new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000));
});

document.getElementById("jump-to-next-week").addEventListener("click", () => {
  const nextWeek = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
  timeline.setWindow(nextWeek, new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000));
});

// Render Timeline Chart
function renderTimelineChart(tasks) {
    console.log("Tasks for timeline chart:", tasks);
    const timelineEl = document.getElementById("timeline");
    timelineEl.innerHTML = ""; // Clear previous content

    const items = tasks.map((task) => ({
        id: task.id,
        content: task.title,
        start: task.startDate,
        end: task.endDate,
        className: `timeline-task-${task.status.toLowerCase().replace(" ", "-")}`,
    }));

    const timeline = new vis.Timeline(timelineEl, new vis.DataSet(items), {
        showCurrentTime: true,
        zoomable: true,
        editable: true,
    });
}

// Initialize the page by fetching tasks
fetchTasks();
