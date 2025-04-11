// DOM Elements
const taskListView = document.getElementById("task-list");
const calendarView = document.getElementById("calendar-view");
const timelineView = document.getElementById("timeline-view");
const analyticsView = document.getElementById("analytics-view");
const addSubtaskSection = document.getElementById("add-subtask");
const subtaskForm = document.getElementById("subtaskForm");
let timeline;
let activeCharts = []; // Track all active charts

// View Navigation
document.getElementById("view-tasks").addEventListener("click", showTaskList);
document.getElementById("view-calendar").addEventListener("click", showCalendar);
document.getElementById("view-timeline").addEventListener("click", showTimeline);
document.getElementById("view-analytics").addEventListener("click", showAnalytics);

// Timeline Navigation
document.getElementById("jump-to-today").addEventListener("click", jumpToToday);
document.getElementById("jump-to-tomorrow").addEventListener("click", jumpToTomorrow);
document.getElementById("jump-to-next-week").addEventListener("click", jumpToNextWeek);

// Form Submissions
document.getElementById("taskForm").addEventListener("submit", handleTaskSubmit);
subtaskForm.addEventListener("submit", handleSubtaskSubmit);

// Initialize
fetchTasks();

// View Functions
function showTaskList() {
    hideAllViews();
    taskListView.classList.remove("hidden");
    fetchTasks();
}

function showCalendar() {
    hideAllViews();
    calendarView.classList.remove("hidden");
    fetchTasks().then(initializeCalendar);
}

function showTimeline() {
    hideAllViews();
    timelineView.classList.remove("hidden");
    fetchTasks().then(renderTimelineChart);
}

function showAnalytics() {
    hideAllViews();
    analyticsView.classList.remove("hidden");
    // Create the analytics container structure
    analyticsView.innerHTML = `
        <div class="analytics-container">
            <h2>Task Analytics</h2>
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>Completion Rate</h3>
                    <div class="chart-container">
                        <canvas id="completion-chart"></canvas>
                    </div>
                    <div class="chart-legend" id="completion-legend"></div>
                </div>
                <div class="analytics-card">
                    <h3>Priority Distribution</h3>
                    <div class="chart-container">
                        <canvas id="priority-chart"></canvas>
                    </div>
                    <div class="chart-legend" id="priority-legend"></div>
                </div>
                <div class="analytics-card">
                    <h3>Progress Overview</h3>
                    <div class="chart-container">
                        <canvas id="progress-chart"></canvas>
                    </div>
                    <div class="chart-legend" id="progress-legend"></div>
                </div>
                <div class="analytics-card">
                    <h3>Task Duration</h3>
                    <div class="chart-container">
                        <canvas id="duration-chart"></canvas>
                    </div>
                    <div class="chart-legend" id="duration-legend"></div>
                </div>
            </div>
        </div>
    `;
    fetchTasks().then(renderAnalytics);
}

function hideAllViews() {
    taskListView.classList.add("hidden");
    calendarView.classList.add("hidden");
    timelineView.classList.add("hidden");
    analyticsView.classList.add("hidden");
}
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
// Timeline Navigation
function jumpToToday() {
    const today = new Date();
    timeline.setWindow(today, new Date(today.getTime() + 24 * 60 * 60 * 1000), {animation: true});
}

function jumpToTomorrow() {
    const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    timeline.setWindow(tomorrow, new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000), {animation: true});
}

function jumpToNextWeek() {
    const nextWeek = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
    timeline.setWindow(nextWeek, new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000), {animation: true});
}

// Data Fetching
async function fetchTasks() {
    try {
        document.getElementById("tasks").innerHTML = "<li>Loading tasks...</li>";
        const response = await fetch("http://127.0.0.1:5000/tasks");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const tasks = await response.json();
        
        // Auto-update status to "Done" if progress is 100%
        const updatedTasks = tasks.map(task => {
            if (task.progress === 100 && task.status !== "Done") {
                updateTaskStatus(task.id, "Done");
                return {...task, status: "Done"};
            }
            return task;
        });
        
        displayTasks(updatedTasks);
        return updatedTasks;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        alert("Failed to fetch tasks. Please check the console for details.");
        return [];
    }
}

async function updateTaskStatus(taskId, status) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
        console.error("Error updating task status:", error);
    }
}

async function fetchSubtasks(taskId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}/subtasks`);
        if (!response.ok) throw new Error('Failed to fetch subtasks');
        return await response.json();
    } catch (error) {
        console.error('Error fetching subtasks:', error);
        alert('Failed to load subtasks');
        return [];
    }
}

// Task Display
function displayTasks(tasks) {
    const taskList = document.getElementById("tasks");
    taskList.innerHTML = tasks.length ? "" : "<li>No tasks available.</li>";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";
        li.setAttribute("data-id", task.id);
        li.setAttribute("draggable", "true");
        const priority = task.priority || "Medium";

        li.innerHTML = `
            <div class="task-header">
                <span class="task-title ${priority.toLowerCase()}">${task.title}</span>
                <span class="task-status">${task.status}</span>
            </div>
            <div class="task-progress">
                <div class="progress-bar" style="width: ${task.progress}%"></div>
                <span class="progress-text">${task.progress}%</span>
            </div>
            <div class="task-details">
                <span>Start: ${formatDate(task.startDate)}</span>
                <span>End: ${formatDate(task.endDate)}</span>
            </div>
            <div class="task-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
                <button class="progress-btn">Update Progress</button>
                <button class="add-subtask-btn">Add Subtask</button>
            </div>
            <div class="subtasks-container" data-task-id="${task.id}">
                <button class="show-subtasks">Show Subtasks</button>
                <ul class="subtasks-list hidden"></ul>
            </div>
        `;

        // Add event listeners
        li.querySelector('.edit-btn').onclick = () => editTask(task.id);
        li.querySelector('.delete-btn').onclick = () => deleteTask(task.id);
        li.querySelector('.progress-btn').onclick = () => updateProgress(task.id);
        li.querySelector('.add-subtask-btn').onclick = () => showAddSubtaskForm(task.id);
        li.querySelector('.show-subtasks').onclick = () => toggleSubtasks(task.id);

        taskList.appendChild(li);
    });
    initializeDragAndDrop();
}

// Task CRUD Operations
async function handleTaskSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    try {
        const response = await fetch("http://127.0.0.1:5000/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: form.taskTitle.value,
                description: form.taskDescription.value,
                startDate: form.taskStartDate.value,
                endDate: form.taskEndDate.value,
                priority: form.taskPriority.value,
                progress: 0,
                status: "To Do"
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        showSuccessMessage('Task added successfully!');
        form.reset();
        const tasks = await fetchTasks();
        
        // Refresh views that might be affected
        if (!calendarView.classList.contains("hidden")) initializeCalendar(tasks);
        if (!timelineView.classList.contains("hidden")) renderTimelineChart(tasks);
        if (!analyticsView.classList.contains("hidden")) renderAnalytics(tasks);
    } catch (error) {
        console.error("Error creating task:", error);
        alert(`Failed to create task: ${error.message}`);
    }
}

function formatDate(dateString) {
    if (!dateString) return "No date";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toString() !== 'Invalid Date' ? date.toLocaleDateString(undefined, options) : "Invalid date";
}

function formatDateForInput(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toString() !== 'Invalid Date' ? date.toISOString().split('T')[0] : "";
}

async function editTask(taskId) {
    const tasks = await fetchTasks();
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const newTitle = prompt("Enter new title:", currentTask.title);
    if (newTitle === null || !newTitle.trim()) return;

    const newDescription = prompt("Enter new description:", currentTask.description || "");
    const newEndDate = prompt("Enter new end date (YYYY-MM-DD):", formatDateForInput(currentTask.endDate));
    const newPriority = prompt("Enter new priority (High/Medium/Low):", currentTask.priority);
    const newStatus = prompt("Enter new status (To Do/In Progress/Done):", currentTask.status);

    try {
        const updateData = {
            title: newTitle,
            description: newDescription,
            priority: newPriority,
            status: newStatus
        };

        if (newEndDate) {
            updateData.endDate = newEndDate;
        }

        const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const tasks = await fetchTasks();
        
        // Refresh views that might be affected
        if (!calendarView.classList.contains("hidden")) initializeCalendar(tasks);
        if (!timelineView.classList.contains("hidden")) renderTimelineChart(tasks);
        if (!analyticsView.classList.contains("hidden")) renderAnalytics(tasks);
    } catch (error) {
        console.error("Error updating task:", error);
        alert("Failed to update task.");
    }
}

async function deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
            method: "DELETE",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const tasks = await fetchTasks();
        
        // Refresh views that might be affected
        if (!calendarView.classList.contains("hidden")) initializeCalendar(tasks);
        if (!timelineView.classList.contains("hidden")) renderTimelineChart(tasks);
        if (!analyticsView.classList.contains("hidden")) renderAnalytics(tasks);
    } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task.");
    }
}

async function updateProgress(taskId) {
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    if (!taskElement) return;
    
    taskElement.style.opacity = "0.7"; 
    const newProgress = prompt("Enter progress percentage (0-100):");
    if (newProgress === null) {
        taskElement.style.opacity = "1";
        return;
    }

    const progressValue = parseInt(newProgress);
    if (isNaN(progressValue)) {
        alert("Please enter a valid number");
        taskElement.style.opacity = "1";
        return;
    }
    if (progressValue < 0 || progressValue > 100) {
        alert("Progress must be between 0 and 100");
        taskElement.style.opacity = "1";
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}/progress`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ progress: progressValue })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        // Automatically set status to "Done" if progress is 100%
        if (progressValue === 100) {
            await updateTaskStatus(taskId, "Done");
        }
        
        const tasks = await fetchTasks();
        
        taskElement.style.opacity = "1";
        taskElement.querySelector('.progress-bar').style.width = `${progressValue}%`;
        taskElement.querySelector('.progress-text').textContent = `${progressValue}%`;
        
        // Refresh views that might be affected
        if (!calendarView.classList.contains("hidden")) initializeCalendar(tasks);
        if (!timelineView.classList.contains("hidden")) renderTimelineChart(tasks);
        if (!analyticsView.classList.contains("hidden")) renderAnalytics(tasks);
    } catch (error) {
        console.error("Error updating progress:", error);
        alert(`Failed to update progress: ${error.message}`);
        taskElement.style.opacity = "1";
    }
}

// Subtask Functions
function showAddSubtaskForm(taskId) {
    document.getElementById("subtaskTaskId").value = taskId;
    addSubtaskSection.classList.remove("hidden");
    
    // Add explanation text
    const explanation = document.createElement('p');
    explanation.className = 'subtask-explanation';
    explanation.textContent = 'Subtasks help break your task into smaller, manageable steps. Add as many as you need.';
    
    // Insert the explanation at the top of the form
    if (!addSubtaskSection.querySelector('.subtask-explanation')) {
        addSubtaskSection.insertBefore(explanation, addSubtaskSection.firstChild);
    }
}
async function handleSubtaskSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const taskId = form.subtaskTaskId.value;
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}/subtasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: form.subtaskTitle.value,
                description: form.subtaskDescription.value || "",
                completed: false,
                position: 0
            }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        showSuccessMessage('Subtask added successfully!');

        form.reset();
        addSubtaskSection.classList.add("hidden");
        fetchTasks();
    } catch (error) {
        console.error("Error creating subtask:", error);
        alert("Failed to create subtask.");
    }
}

async function toggleSubtasks(taskId) {
    const container = document.querySelector(`.subtasks-container[data-task-id="${taskId}"]`);
    if (!container) return;
    
    const subtasksList = container.querySelector('.subtasks-list');
    const button = container.querySelector('.show-subtasks');
    
    if (subtasksList.classList.contains('hidden')) {
        const subtasks = await fetchSubtasks(taskId);
        subtasksList.innerHTML = subtasks.length ? "" : "<li>No subtasks yet. Add some to break down this task</li>";
        
        subtasks.forEach(subtask => {
            const li = document.createElement('li');
            li.innerHTML = `
           <div class="subtask-item ${subtask.completed ? 'completed' : ''}" data-id="${subtask.id}">
                    <input type="checkbox" ${subtask.completed ? 'checked' : ''}
                           onchange="toggleSubtaskCompletion(${subtask.id}, this.checked)">
                    <span class="subtask-title">${subtask.title}</span>
                    ${subtask.description ? `<div class="subtask-desc">${subtask.description}</div>` : ''}
                </div>
            `;
            subtasksList.appendChild(li);
            subtasksList.querySelectorAll('.subtask-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    // Don't toggle if clicking on checkbox
                    if (e.target.tagName === 'INPUT') return;
                    
                    const desc = this.querySelector('.subtask-desc');
                    if (desc) {
                        desc.classList.toggle('show');
                    }
                });
            });
        }); 
        
        button.textContent = 'Hide Subtasks';
        subtasksList.classList.remove('hidden');
    } else {
        button.textContent = 'Show Subtasks';
        subtasksList.classList.add('hidden');
    }
}

window.toggleSubtaskCompletion = async function toggleSubtaskCompletion(subtaskId, completed) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/subtasks/${subtaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        
        if (!response.ok) throw new Error('Failed to update subtask');
        const subtaskItem = document.querySelector(`.subtask-item[data-id="${subtaskId}"]`);
        if (subtaskItem) {
            subtaskItem.classList.toggle('completed', completed);
        }
    } catch (error) {
        console.error('Error updating subtask:', error);
    }
}

// Drag and Drop
function initializeDragAndDrop() {
    const taskList = document.getElementById("tasks");
    if (!taskList) return;
    
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
        if (!draggedTask) return;
        
        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) {
            taskList.appendChild(draggedTask);
        } else {
            taskList.insertBefore(draggedTask, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
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
    }
}

// Calendar View - Updated with better tooltips
function initializeCalendar(tasks) {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;
    
    // Clear any existing calendar
    calendarEl.innerHTML = '';
    
    const calendarTasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        start: task.startDate ? new Date(task.startDate) : null,
        end: task.endDate ? new Date(task.endDate) : null,
        extendedProps: {
            description: task.description || 'No description',
            status: task.status,
            priority: task.priority,
            progress: task.progress
        },
        color: getPriorityColor(task.priority)
    }));

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: calendarTasks.filter(event => event.start && event.end),
        eventDidMount: function(info) {
            // Create custom tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'calendar-tooltip';
            tooltip.innerHTML = `
                <div class="tooltip-header ${info.event.extendedProps.priority.toLowerCase()}">
                    ${info.event.title}
                </div>
                <div class="tooltip-body">
                    <p><strong>Description:</strong> ${info.event.extendedProps.description}</p>
                    <p><strong>Status:</strong> ${info.event.extendedProps.status}</p>
                    <p><strong>Priority:</strong> ${info.event.extendedProps.priority}</p>
                    <p><strong>Progress:</strong> ${info.event.extendedProps.progress}%</p>
                    <p><strong>Dates:</strong> ${info.event.start?.toLocaleDateString() || 'No start'} - ${info.event.end?.toLocaleDateString() || 'No end'}</p>
                </div>
            `;
            
            // Position and show tooltip on hover
            info.el.addEventListener('mouseenter', () => {
                document.body.appendChild(tooltip);
                const rect = info.el.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 10}px`;
                tooltip.style.opacity = '1';
            });
            
            // Remove tooltip when mouse leaves
            info.el.addEventListener('mouseleave', () => {
                if (document.body.contains(tooltip)) {
                    document.body.removeChild(tooltip);
                }
            });
        }
    });
    calendar.render();
}

// Timeline View
function renderTimelineChart(tasks) {
    const timelineEl = document.getElementById("timeline");
    if (!timelineEl) return;
    
    timelineEl.innerHTML = "";
    timelineEl.style.minHeight = "600px";

    // Filter out tasks without valid dates
    const validTasks = tasks.filter(task => {
        if (!task.startDate || !task.endDate) return false;
        
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        return startDate.toString() !== 'Invalid Date' && 
               endDate.toString() !== 'Invalid Date' &&
               startDate <= endDate;
    });

    if (validTasks.length === 0) {
        timelineEl.innerHTML = "<p>No tasks with valid dates to display</p>";
        return;
    }

    const items = new vis.DataSet(validTasks.map(task => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        
        return {
            id: task.id,
            content: `
                <div class="timeline-task">
                    <div class="timeline-task-header ${task.priority.toLowerCase()}">
                        ${task.title}
                    </div>
                    <div class="timeline-task-progress">
                        <div class="timeline-progress-bar" style="width: ${task.progress}%"></div>
                    </div>
                    <div class="timeline-task-details">
                        <span>Status: ${task.status}</span>
                        <span>Priority: ${task.priority}</span>
                    </div>
                </div>
            `,
            start: startDate,
            end: endDate,
            className: `timeline-item-${task.priority.toLowerCase()}`,
            style: `border-left: 5px solid ${getPriorityColor(task.priority)}`
        };
    }));

    timeline = new vis.Timeline(timelineEl, items, {
        showCurrentTime: true,
        zoomable: true,
        editable: true,
        margin: { item: 10 },
        orientation: 'top',
        showTooltips: true,
        height: '100%',
        tooltip: {
            followMouse: true,
            overflowMethod: 'cap'
        }
    });

    // Add click event to show full task details
    timeline.on('click', function(properties) {
        const taskId = properties.item;
        if (taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                showTaskDetails(task);
            }
        }
    });

    timeline.fit();
}

function showTaskDetails(task) {
    const modal = document.createElement('div');
    modal.className = 'task-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>${task.title}</h3>
            <p><strong>Description:</strong> ${task.description || 'None'}</p>
            <p><strong>Status:</strong> ${task.status}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Progress:</strong> ${task.progress}%</p>
            <p><strong>Start Date:</strong> ${formatDate(task.startDate)}</p>
            <p><strong>End Date:</strong> ${formatDate(task.endDate)}</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').onclick = () => {
        document.body.removeChild(modal);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Analytics View - Fully fixed version
function renderAnalytics(tasks) {
    const analyticsContainer = document.getElementById("analytics-view");
    if (!analyticsContainer) return;

    if (!tasks || tasks.length === 0) {
        analyticsContainer.innerHTML = "<p>No tasks available for analytics</p>";
        return;
    }

    // Clear any existing charts
    activeCharts.forEach(chart => {
        if (chart) chart.destroy();
    });
    activeCharts = [];

    // Completion Rate Chart
    const completedTasks = tasks.filter(t => t.status === "Done").length;
    const pendingTasks = tasks.length - completedTasks;
    const completionChart = renderDoughnutChart(
        'completion-chart', 
        ['Completed', 'Pending'], 
        [completedTasks, pendingTasks], 
        ['#4CAF50', '#F44336'], 
        'Completion Rate',
        [`Completed: ${completedTasks}`, `Pending: ${pendingTasks}`]
    );
    if (completionChart) activeCharts.push(completionChart);
    
    document.getElementById('completion-legend').innerHTML = `
        <p><span class="legend-color" style="background-color:#4CAF50"></span> Completed: ${completedTasks}</p>
        <p><span class="legend-color" style="background-color:#F44336"></span> Pending: ${pendingTasks}</p>
        <p>Total: ${tasks.length} tasks</p>
    `;

    // Priority Distribution Chart
    const priorityData = {
        High: tasks.filter(t => t.priority === 'High').length,
        Medium: tasks.filter(t => t.priority === 'Medium').length,
        Low: tasks.filter(t => t.priority === 'Low').length
    };
    const priorityChart = renderBarChart(
        'priority-chart', 
        ['High', 'Medium', 'Low'], 
        [priorityData.High, priorityData.Medium, priorityData.Low], 
        ['#FF5252', '#FFD740', '#69F0AE'], 
        'Priority Distribution'
    );
    if (priorityChart) activeCharts.push(priorityChart);
    
    document.getElementById('priority-legend').innerHTML = `
        <p><span class="legend-color" style="background-color:#FF5252"></span> High: ${priorityData.High}</p>
        <p><span class="legend-color" style="background-color:#FFD740"></span> Medium: ${priorityData.Medium}</p>
        <p><span class="legend-color" style="background-color:#69F0AE"></span> Low: ${priorityData.Low}</p>
    `;

    // Progress Overview Chart
    const progressData = [0, 0, 0, 0];
    const progressLabels = ['0-25%', '26-50%', '51-75%', '76-100%'];
    const progressDescriptions = [
        'Just Started (0-25%)',
        'In Progress (26-50%)',
        'Almost Done (51-75%)',
        'Nearly Completed (76-100%)'
    ];
    
    tasks.forEach(task => {
        if (task.progress <= 25) progressData[0]++;
        else if (task.progress <= 50) progressData[1]++;
        else if (task.progress <= 75) progressData[2]++;
        else progressData[3]++;
    });
    
    const progressChart = renderPieChart(
        'progress-chart', 
        progressLabels, 
        progressData, 
        ['#FF5252', '#FFD740', '#2196F3', '#4CAF50'], 
        'Progress Distribution',
        progressDescriptions
    );
    if (progressChart) activeCharts.push(progressChart);
    
    document.getElementById('progress-legend').innerHTML = `
        <p><span class="legend-color" style="background-color:#FF5252"></span> 0-25%: ${progressData[0]}</p>
        <p><span class="legend-color" style="background-color:#FFD740"></span> 26-50%: ${progressData[1]}</p>
        <p><span class="legend-color" style="background-color:#2196F3"></span> 51-75%: ${progressData[2]}</p>
        <p><span class="legend-color" style="background-color:#4CAF50"></span> 76-100%: ${progressData[3]}</p>
    `;

    // Task Duration Chart:
    const durationData = tasks
    .map(task => {
        try {
            const start = task.startDate ? new Date(task.startDate) : new Date();
            const end = task.endDate ? new Date(task.endDate) : new Date();
            const duration = Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
            return {
                title: task.title.length > 15 ? task.title.substring(0, 12) + '...' : task.title,
                duration: duration,
                priority: task.priority
            };
        } catch (e) {
            return null;
        }
    })
    .filter(d => d !== null && d.duration > 0)
    .sort((a, b) => b.duration - a.duration);

    if (durationData.length > 0) {
    const durationChart = new Chart(document.getElementById('duration-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: durationData.map(t => t.title),
            datasets: [{
                data: durationData.map(t => t.duration),
                backgroundColor: durationData.map(t => getPriorityColor(t.priority)),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: { x: { beginAtZero: true } },
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Task Durations (Days)' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw.toFixed(1)} days (${durationData[context.dataIndex].priority} priority)`;
                        }
                    }
                }
            }
        }
    });
    activeCharts.push(durationChart);

    document.getElementById('duration-legend').innerHTML = `
        <p>All tasks by duration (days)</p>
        ${durationData.map(t => `
            <p>
                <span class="legend-color" style="background-color:${getPriorityColor(t.priority)}"></span>
                ${t.title}: ${t.duration.toFixed(1)} days
            </p>
        `).join('')}
    `;
    }

    // Add click handlers for chart expansion
    document.querySelectorAll('.analytics-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't expand if clicking on legend or other non-chart elements
            if (!e.target.closest('canvas') && !e.target.closest('.chart-container')) return;
            
            const chartId = this.querySelector('canvas').id;
            if (chartId) expandChart(chartId);
        });
    });
}

function expandChart(chartId) {
    // Remove any existing expanded chart
    const existingModal = document.querySelector('.chart-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'chart-modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.className = 'close-modal';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => modal.remove();
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = document.querySelector(`#${chartId}`).parentElement.parentElement.querySelector('h3').textContent;
    
    // Add canvas
    const canvas = document.createElement('canvas');
    canvas.id = `${chartId}-expanded`;
    canvas.style.maxHeight = '70vh';
    canvas.style.maxWidth = '80vw';
    
    // Build modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(canvas);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Get the original chart data
    const originalCanvas = document.getElementById(chartId);
    const originalChart = Chart.getChart(originalCanvas);
    
    if (originalChart) {
        // Create expanded chart
        const expandedChart = new Chart(canvas, {
            type: originalChart.config.type,
            data: JSON.parse(JSON.stringify(originalChart.config.data)),
            options: {
                ...originalChart.config.options,
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    ...originalChart.config.options.plugins,
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: title.textContent,
                        font: {
                            size: 18
                        }
                    }
                }
            }
        });
        activeCharts.push(expandedChart);
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Chart Rendering Helpers
function renderDoughnutChart(elementId, labels, data, colors, title, tooltipLabels) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return null;
    
    // Destroy previous chart if it exists
    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: { 
            labels: labels,
            datasets: [{ 
                data: data, 
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: '#fff'
            }] 
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: { 
                legend: { 
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return tooltipLabels[context.dataIndex] || '';
                        }
                    }
                },
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function renderBarChart(elementId, labels, data, colors, title) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return null;
    
    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();
    
    return new Chart(ctx, {
        type: 'bar',
        data: { 
            labels: labels,
            datasets: [{ 
                data: data, 
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: '#fff'
            }] 
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
                y: { 
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: { 
                legend: { 
                    display: false 
                },
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}


function renderPieChart(elementId, labels, data, colors, title) {
    new Chart(document.getElementById(elementId).getContext('2d'), {
        type: 'pie',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 1 }] },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' }, title: { display: true, text: title } }
        }
    });
}

function renderHorizontalBarChart(elementId, labels, data, color, title) {
    new Chart(document.getElementById(elementId).getContext('2d'), {
        type: 'bar',
        data: { labels, datasets: [{ data, backgroundColor: color, borderWidth: 1 }] },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: { x: { beginAtZero: true } },
            plugins: { legend: { display: false }, title: { display: true, text: title } }
        }
    });
}

// Utility Functions
function getPriorityColor(priority) {
    switch(priority) {
        case 'High': return '#ff4444';
        case 'Medium': return '#ffbb33';
        case 'Low': return '#00C851';
        default: return '#3a87ad';
    }
}
