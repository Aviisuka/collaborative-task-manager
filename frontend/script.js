// Toggle views
const taskListView = document.getElementById("task-list");
const calendarView = document.getElementById("calendar-view");
const ganttView = document.getElementById("gantt-view");

// Toggle between task list and calendar view
document.getElementById("view-tasks").addEventListener("click", () => {
  taskListView.classList.remove("hidden");
  calendarView.classList.add("hidden");
  ganttView.classList.add("hidden");
  fetchTasks(); // Fetch tasks whenever Task List is clicked
});

document.getElementById("view-calendar").addEventListener("click", () => {
  calendarView.classList.remove("hidden");
  taskListView.classList.add("hidden");
  ganttView.classList.add("hidden");
  initCalendar(); // Call initCalendar when the calendar view is clicked
});

document.getElementById("view-gantt").addEventListener("click", () => {
  ganttView.classList.remove("hidden");
  taskListView.classList.add("hidden");
  calendarView.classList.add("hidden");
  initGanttChart();  // Initialize Gantt chart when the view is switched
});

// Initialize the calendar
function initCalendar() {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: async function(info, successCallback, failureCallback) {
      try {
        const response = await fetch('http://127.0.0.1:5000/tasks');
        const tasks = await response.json();
        
        // Ensure tasks contain valid start and end dates
        const events = tasks.map(task => ({
          title: task.title,
          start: task.startDate,  // Ensure startDate is in ISO 8601 format
          end: task.endDate,      // Ensure endDate is in ISO 8601 format
        }));
        successCallback(events);
      } catch (error) {
        console.error('Error fetching tasks for calendar:', error);
        failureCallback(error);
      }
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    }
  });

  calendar.render();
}


// Initialize the Gantt chart
async function initGanttChart() {
  const tasks = await fetchTasks();  // Ensure tasks are fetched correctly

  // Validate tasks data
  if (!tasks || tasks.length === 0) {
    console.error("No tasks found for Gantt chart.");
    return;
  }

  const ganttData = tasks.map(task => ({
    id: task.id,
    name: task.title,
    start: task.startDate,  // Ensure startDate is in ISO format
    end: task.endDate,      // Ensure endDate is in ISO format
    progress: task.status === "Done" ? 100 : 0
  }));

  const ganttContainer = document.getElementById("gantt");
  if (ganttContainer) {
    const gantt = new Gantt("#gantt", ganttData, {
      view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
      bar_height: 20,
      padding: 18,
    });
    gantt.render();
  } else {
    console.error("Gantt container not found.");
  }
}

async function fetchTasks() {
  try {
    const response = await fetch('http://127.0.0.1:5000/tasks');
    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

// Adding task
document.getElementById("taskForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const task = {
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("task-description").value,
    startDate: document.getElementById("taskStartDate").value,
    endDate: document.getElementById("taskEndDate").value
  };

  fetch('http://127.0.0.1:5000/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  })
  .then(response => response.json())
  .then(data => {
    console.log('New task added:', data);
    // Reload tasks after adding
    fetchTasks();  // Call fetchTasks instead of loadTasks
  })
  .catch(error => console.error('Error adding task:', error));
});


// Fetch tasks from Flask backend
async function fetchTasks() {
  try {
    console.log("Fetching tasks...");
    const response = await fetch("http://127.0.0.1:5000/tasks");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const tasks = await response.json();
    console.log("tasks fetched:", tasks);
    displayTasks(tasks);
    return tasks;  // Return tasks for Gantt Chart
  } catch (error) {
    console.error("Error fetching tasks:", error);
    alert("Failed to fetch tasks. Please check the console for details.");
    return [];  // Return an empty array if there was an error
  }
}

// Display tasks in task list view
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

// Initialize the page by fetching tasks and rendering them
fetchTasks();
