const DEBUG = true;
function debugLog(...messages) {
    if (DEBUG) console.log('[DEBUG]', ...messages);
}

// DOM Elements
const elements = {
    // Main views
    taskListView: document.getElementById("task-list"),
    calendarView: document.getElementById("calendar-view"),
    timelineView: document.getElementById("timeline-view"),
    analyticsView: document.getElementById("analytics-view"),
    
    // Forms and sections
    addTaskSection: document.getElementById("add-task"),
    addSubtaskSection: document.getElementById("add-subtask-section"),
    loginSection: document.getElementById("login-section"),
    registerSection: document.getElementById("register-section"),
    
    // Forms
    taskForm: document.getElementById("taskForm"),
    subtaskForm: document.getElementById("subtaskForm"),
    loginForm: document.getElementById("loginForm"),
    registerForm: document.getElementById("registerForm"),
    
    // Buttons
    loginBtn: document.getElementById("login-btn"),
    registerBtn: document.getElementById("register-btn"),
    logoutBtn: document.getElementById("logout-btn"),
    
    // Navigation buttons
    viewTasksBtn: document.getElementById("view-tasks"),
    viewCalendarBtn: document.getElementById("view-calendar"),
    viewTimelineBtn: document.getElementById("view-timeline"),
    viewAnalyticsBtn: document.getElementById("view-analytics"),
    
    // Timeline navigation
    jumpToTodayBtn: document.getElementById("jump-to-today"),
    jumpToTomorrowBtn: document.getElementById("jump-to-tomorrow"),
    jumpToNextWeekBtn: document.getElementById("jump-to-next-week"),
    
    // Subtask cancel button
    cancelSubtaskBtn: document.getElementById("cancel-subtask"),
    
    // Task list
    tasksContainer: document.getElementById("tasks"),
    
    // Message elements
    loginMessage: document.getElementById("login-message"),
    registerMessage: document.getElementById("register-message"),
    
    // Calendar element
    calendarEl: document.getElementById("calendar")
};

let timeline;
let activeCharts = [];
// Global filter state
let globalFilters = {
    priorities: ['High', 'Medium', 'Low'],
    statuses: ['To Do', 'In Progress', 'Done'],
    subtasks: 'all' // 'all', 'hasSubtasks', 'noSubtasks'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOM fully loaded');
    initializeApplication();
    checkAuthStatus();
});

function initializeApplication() {
    debugLog('Initializing application...');
    
    // Verify all required elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            debugLog(`Element not found: ${key}`);
        } else {
            debugLog(`Element found: ${key}`);
        }
    }
    
    // Navigation
    if (elements.viewTasksBtn) {
        elements.viewTasksBtn.addEventListener("click", showTaskList);
        debugLog('Added event listener for viewTasksBtn');
    }
    
    if (elements.viewCalendarBtn) {
        elements.viewCalendarBtn.addEventListener("click", showCalendar);
        debugLog('Added event listener for viewCalendarBtn');
    }
    
    if (elements.viewTimelineBtn) {
        elements.viewTimelineBtn.addEventListener("click", showTimeline);
        debugLog('Added event listener for viewTimelineBtn');
    }
    
    if (elements.viewAnalyticsBtn) {
        elements.viewAnalyticsBtn.addEventListener("click", showAnalytics);
        debugLog('Added event listener for viewAnalyticsBtn');
    }
    
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener("click", showLogin);
        debugLog('Added event listener for loginBtn');
    }
    
    if (elements.registerBtn) {
        elements.registerBtn.addEventListener("click", showRegister);
        debugLog('Added event listener for registerBtn');
    }
    
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener("click", logout);
        debugLog('Added event listener for logoutBtn');
    }

    // Timeline Navigation
    if (elements.jumpToTodayBtn) {
        elements.jumpToTodayBtn.addEventListener("click", jumpToToday);
        debugLog('Added event listener for jumpToTodayBtn');
    }
    
    if (elements.jumpToTomorrowBtn) {
        elements.jumpToTomorrowBtn.addEventListener("click", jumpToTomorrow);
        debugLog('Added event listener for jumpToTomorrowBtn');
    }
    
    if (elements.jumpToNextWeekBtn) {
        elements.jumpToNextWeekBtn.addEventListener("click", jumpToNextWeek);
        debugLog('Added event listener for jumpToNextWeekBtn');
    }

    // Form Submissions
    if (elements.taskForm) {
        elements.taskForm.addEventListener("submit", handleTaskSubmit);
        debugLog('Added event listener for taskForm');
    }
    
    if (elements.loginForm) {
        elements.loginForm.addEventListener("submit", handleLogin);
        debugLog('Added event listener for loginForm');
    }
    
    if (elements.registerForm) {
        elements.registerForm.addEventListener("submit", handleRegister);
        debugLog('Added event listener for registerForm');
    }
    if (elements.subtaskForm) {
        elements.subtaskForm.addEventListener("submit", handleSubtaskSubmit);
        debugLog('Added event listener for subtaskForm');
    }
    if (elements.cancelSubtaskBtn) {
        elements.cancelSubtaskBtn.addEventListener("click", () => {
            if (elements.addSubtaskSection) {
                elements.addSubtaskSection.classList.add("hidden");
                debugLog('Hiding addSubtaskSection');
            }
        });
        debugLog('Added event listener for cancelSubtaskBtn');
    }
}

document.getElementById('login-btn').addEventListener('click', () => {
    window.location.href = '/login';
});

document.getElementById('register-btn').addEventListener('click', () => {
    window.location.href = '/register';
});

// Authentication Functions
async function checkAuthStatus() {
    debugLog('Checking authentication status...');
    try {
        const response = await fetch("http://127.0.0.1:5000/check-auth", {
            method: "GET",
            credentials: 'include'
        });
        
        debugLog('Auth check response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        debugLog('Auth status response:', data);
        
        if (data.authenticated) {
            debugLog('User authenticated');
            if (elements.logoutBtn) elements.logoutBtn.classList.remove("hidden");
            if (elements.loginBtn) elements.loginBtn.classList.add("hidden");
            if (elements.registerBtn) elements.registerBtn.classList.add("hidden");
            if (elements.loginSection) elements.loginSection.classList.add("hidden");
            if (elements.registerSection) elements.registerSection.classList.add("hidden");
            if (elements.addTaskSection) elements.addTaskSection.classList.remove("hidden");
            fetchTasks();
            return true;
        } else {
            debugLog('User not authenticated');
            if (elements.logoutBtn) elements.logoutBtn.classList.add("hidden");
            if (elements.loginBtn) elements.loginBtn.classList.remove("hidden");
            if (elements.registerBtn) elements.registerBtn.classList.remove("hidden");
            if (elements.addTaskSection) elements.addTaskSection.classList.add("hidden");
            return false;
        }
    } catch (error) {
        debugLog('Error checking auth:', error);
        return false;
    }
}

function showLogin() {
    hideAllViews();
    if (elements.loginSection) {
        elements.loginSection.classList.remove("hidden");
    }
}

function showRegister() {
    hideAllViews();
    if (elements.registerSection) {
        elements.registerSection.classList.remove("hidden");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    debugLog('Handling registration...');
    
    const username = elements.registerForm.registerUsername.value;
    const password = elements.registerForm.registerPassword.value;
    
    if (!username || !password) {
        showMessage(elements.registerMessage, 'Please enter both username and password', 'error');
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        debugLog('Register response:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }
        
        showMessage(elements.registerMessage, 'Registration successful! Please login.', 'success');
        elements.registerForm.reset();
        setTimeout(showLogin, 1500);
    } catch (error) {
        debugLog('Registration error:', error);
        showMessage(elements.registerMessage, error.message, 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    debugLog('Handling login...');
    
    if (!elements.loginForm) return;
    
    const username = elements.loginForm.loginUsername.value;
    const password = elements.loginForm.loginPassword.value;
    
    if (!username || !password) {
        showMessage(elements.loginMessage, 'Please enter both username and password', 'error');
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        debugLog('Login response:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }
        
        showMessage(elements.loginMessage, 'Login successful!', 'success');
        elements.loginForm.reset();
        checkAuthStatus();
    } catch (error) {
        debugLog('Login error:', error);
        showMessage(elements.loginMessage, error.message, 'error');
    }
}

async function logout() {
    debugLog('Logging out...');
    try {
        const response = await fetch("http://127.0.0.1:5000/logout", {
            method: "POST",
            credentials: 'include'
        });

        debugLog('Logout response status:', response.status);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        showSuccessMessage('Logged out successfully!');
        checkAuthStatus();
    } catch (error) {
        debugLog('Logout error:', error);
        alert(`Failed to log out: ${error.message}`);
    }
}

// View Functions
function showTaskList() {
    hideAllViews();
    if (elements.taskListView) {
        elements.taskListView.classList.remove("hidden");
        addGlobalFilterControls();
        fetchTasks();
    }
}

function showCalendar() {
    hideAllViews();
    if (elements.calendarView) {
        elements.calendarView.classList.remove("hidden");
        fetchTasks().then(tasks => {
            initializeCalendar(tasks);
        });
    }
}

function showTimeline() {
    hideAllViews();
    if (elements.timelineView) {
        elements.timelineView.classList.remove("hidden");
        setupTimelineFilters();
        fetchTasks().then(renderTimelineChart);
    }
}

function showAnalytics() {
    hideAllViews();
    if (elements.analyticsView) {
        elements.analyticsView.classList.remove("hidden");
        // Create the analytics container structure
        elements.analyticsView.innerHTML = `
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
        addAnalyticsFilters();
        fetchTasks().then(renderAnalytics);
    }
}

function hideAllViews() {
    if (elements.taskListView) elements.taskListView.classList.add("hidden");
    if (elements.calendarView) elements.calendarView.classList.add("hidden");
    if (elements.timelineView) elements.timelineView.classList.add("hidden");
    if (elements.analyticsView) elements.analyticsView.classList.add("hidden");
    if (elements.loginSection) elements.loginSection.classList.add("hidden");
    if (elements.registerSection) elements.registerSection.classList.add("hidden");
}

function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = type;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
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
    if (!timeline) return;
    const today = new Date();
    timeline.setWindow(today, new Date(today.getTime() + 24 * 60 * 60 * 1000), {animation: true});
}

function jumpToTomorrow() {
    if (!timeline) return;
    const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    timeline.setWindow(tomorrow, new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000), {animation: true});
}

function jumpToNextWeek() {
    if (!timeline) return;
    const nextWeek = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
    timeline.setWindow(nextWeek, new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000), {animation: true});
}

// Add filter controls to calendar view
function addCalendarFilters(calendar, tasks) {
    // Remove existing filters if they exist
    const existingFilters = document.querySelector('.calendar-filters');
    if (existingFilters) existingFilters.remove();

    const filterContainer = document.createElement('div');
    filterContainer.className = 'calendar-filters';
    filterContainer.innerHTML = `
        <div class="filter-group">
            <h4>Filter by Priority:</h4>
            <label><input type="checkbox" class="priority-filter" value="High" checked> High</label>
            <label><input type="checkbox" class="priority-filter" value="Medium" checked> Medium</label>
            <label><input type="checkbox" class="priority-filter" value="Low" checked> Low</label>
        </div>
        <div class="filter-group">
            <h4>Filter by Status:</h4>
            <label><input type="checkbox" class="status-filter" value="To Do" checked> To Do</label>
            <label><input type="checkbox" class="status-filter" value="In Progress" checked> In Progress</label>
            <label><input type="checkbox" class="status-filter" value="Done" checked> Done</label>
        </div>
        <div class="filter-group">
            <h4>Filter by Subtasks:</h4>
            <label><input type="checkbox" class="subtask-filter" value="hasSubtasks"> Has Subtasks</label>
            <label><input type="checkbox" class="subtask-filter" value="noSubtasks"> No Subtasks</label>
        </div>
        <button id="apply-calendar-filters">Apply Filters</button>
    `;
    
    // Insert filters above the calendar
    elements.calendarEl.parentNode.insertBefore(filterContainer, elements.calendarEl);
    
    // Apply filters when button is clicked
    document.getElementById('apply-calendar-filters').addEventListener('click', function() {
        const checkedPriorities = Array.from(document.querySelectorAll('.calendar-filters .priority-filter:checked'))
            .map(el => el.value);
        const checkedStatuses = Array.from(document.querySelectorAll('.calendar-filters .status-filter:checked'))
            .map(el => el.value);
        const subtaskFilter = document.querySelector('.calendar-filters .subtask-filter:checked')?.value;
        
        // Filter events based on selections
        calendar.getEvents().forEach(event => {
            const matchesPriority = checkedPriorities.includes(event.extendedProps.priority);
            const matchesStatus = checkedStatuses.includes(event.extendedProps.status);
            let matchesSubtask = true;
            
            if (subtaskFilter === 'hasSubtasks') {
                matchesSubtask = event.extendedProps.hasSubtasks;
            } else if (subtaskFilter === 'noSubtasks') {
                matchesSubtask = !event.extendedProps.hasSubtasks;
            }
            
            if (matchesPriority && matchesStatus && matchesSubtask) {
                event.setProp('display', 'auto');
            } else {
                event.setProp('display', 'none');
            }
        });
    });
}

// Timeline filters
function setupTimelineFilters() {
    const timelineControls = document.querySelector('.timeline-controls');
    if (!timelineControls) return;
    
    // Remove existing timeline filters if they exist
    const existingFilters = document.querySelector('.timeline-filters');
    if (existingFilters) existingFilters.remove();
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'timeline-filters';
    filterContainer.innerHTML = `
        <div class="filter-section">
            <h3>Timeline Filters</h3>
            <div class="filter-group">
                <label>Priority:</label>
                <label><input type="checkbox" class="priority-filter" value="High" checked> High</label>
                <label><input type="checkbox" class="priority-filter" value="Medium" checked> Medium</label>
                <label><input type="checkbox" class="priority-filter" value="Low" checked> Low</label>
            </div>
            <button id="apply-timeline-filters">Apply Filters</button>
        </div>
    `;
    
    timelineControls.appendChild(filterContainer);
    document.getElementById('apply-timeline-filters').addEventListener('click', function() {
        const checkedPriorities = Array.from(document.querySelectorAll('.timeline-filters .priority-filter:checked'))
            .map(el => el.value);
        
        if (timeline) {
            timeline.setItems(
                timeline.itemsData.get().filter(item => 
                    checkedPriorities.includes(item.className.replace('timeline-item-', ''))
            ));
        }
    });
}

// Analytics filters
function addAnalyticsFilters() {
    const analyticsHeader = elements.analyticsView.querySelector('h2');
    if (!analyticsHeader) return;
    
    // Remove existing filters if they exist
    const existingFilters = document.querySelector('.analytics-filters');
    if (existingFilters) existingFilters.remove();
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'analytics-filters';
    filterContainer.innerHTML = `
        <div class="filter-section">
            <h3>Analytics Filters</h3>
            <div class="filter-group">
                <label>Priority:</label>
                <label><input type="checkbox" class="priority-filter" value="High" checked> High</label>
                <label><input type="checkbox" class="priority-filter" value="Medium" checked> Medium</label>
                <label><input type="checkbox" class="priority-filter" value="Low" checked> Low</label>
            </div>
            <div class="filter-group">
                <label>Status:</label>
                <label><input type="checkbox" class="status-filter" value="To Do" checked> To Do</label>
                <label><input type="checkbox" class="status-filter" value="In Progress" checked> In Progress</label>
                <label><input type="checkbox" class="status-filter" value="Done" checked> Done</label>
            </div>
            <button id="apply-analytics-filters">Apply Filters</button>
        </div>
    `;
    
    analyticsHeader.insertAdjacentElement('afterend', filterContainer);
    document.getElementById('apply-analytics-filters').addEventListener('click', function() {
        fetchTasks().then(tasks => {
            const filteredTasks = filterTasks(tasks);
            renderAnalytics(filteredTasks);
        });
    });
}

// Apply filters to all views
function applyGlobalFilters() {
    // Update global filter state
    globalFilters.priorities = Array.from(document.querySelectorAll('.global-filters .priority-filter:checked'))
        .map(el => el.value);
    globalFilters.statuses = Array.from(document.querySelectorAll('.global-filters .status-filter:checked'))
        .map(el => el.value);
    globalFilters.subtasks = document.querySelector('.global-filters .subtask-filter').value;
    
    // Refresh all visible views
    refreshCurrentView();
}

// Refresh the currently visible view with filters
function refreshCurrentView() {
    if (!elements.taskListView.classList.contains("hidden")) {
        fetchTasks().then(filterAndDisplayTasks);
    }
    if (!elements.calendarView.classList.contains("hidden")) {
        fetchTasks().then(tasks => {
            const filteredTasks = filterTasks(tasks);
            initializeCalendar(filteredTasks);
        });
    }
    if (!elements.timelineView.classList.contains("hidden")) {
        fetchTasks().then(tasks => {
            const filteredTasks = filterTasks(tasks);
            renderTimelineChart(filteredTasks);
        });
    }
    if (!elements.analyticsView.classList.contains("hidden")) {
        fetchTasks().then(tasks => {
            const filteredTasks = filterTasks(tasks);
            renderAnalytics(filteredTasks);
        });
    }
}

// Filter tasks based on global filters
function filterTasks(tasks) {
    return tasks.filter(task => {
        const matchesPriority = globalFilters.priorities.includes(task.priority);
        const matchesStatus = globalFilters.statuses.includes(task.status);
        
        // For subtask filtering, we need to check if the task has subtasks
        let matchesSubtask = true;
        if (globalFilters.subtasks === 'hasSubtasks') {
            matchesSubtask = task.hasSubtasks === true;
        } else if (globalFilters.subtasks === 'noSubtasks') {
            matchesSubtask = task.hasSubtasks !== true;
        }
        
        return matchesPriority && matchesStatus && matchesSubtask;
    });
}

// Update displayTasks to use filtered tasks
function filterAndDisplayTasks(tasks) {
    const filteredTasks = filterTasks(tasks);
    displayTasks(filteredTasks);
}

// Add global filter controls to the header
function addGlobalFilterControls() {
    const header = document.querySelector('header');
    if (!header) return;
    
    // Remove existing filters if they exist
    const existingFilters = document.querySelector('.global-filters');
    if (existingFilters) existingFilters.remove();
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'global-filters';
    filterContainer.innerHTML = `
        <div class="filter-section">
            <h3>Task List Filters</h3>
            <div class="filter-group">
                <label>Priority:</label>
                <label><input type="checkbox" class="priority-filter" value="High" checked> High</label>
                <label><input type="checkbox" class="priority-filter" value="Medium" checked> Medium</label>
                <label><input type="checkbox" class="priority-filter" value="Low" checked> Low</label>
            </div>
            <div class="filter-group">
                <label>Status:</label>
                <label><input type="checkbox" class="status-filter" value="To Do" checked> To Do</label>
                <label><input type="checkbox" class="status-filter" value="In Progress" checked> In Progress</label>
                <label><input type="checkbox" class="status-filter" value="Done" checked> Done</label>
            </div>
            <div class="filter-group">
                <label>Subtasks:</label>
                <select class="subtask-filter">
                    <option value="all">All Tasks</option>
                    <option value="hasSubtasks">Has Subtasks</option>
                    <option value="noSubtasks">No Subtasks</option>
                </select>
            </div>
            <button id="apply-global-filters">Apply Filters</button>
        </div>
    `;
    
    header.appendChild(filterContainer);
    document.getElementById('apply-global-filters').addEventListener('click', applyGlobalFilters);
}

// Data Fetching
async function fetchTasks() {
    try {
        if (elements.tasksContainer) {
            elements.tasksContainer.innerHTML = "<li>Loading tasks...</li>";
        }
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
            credentials: 'include',
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
    if (!elements.tasksContainer) return;
    
    elements.tasksContainer.innerHTML = tasks.length ? "" : "<li>No tasks available.</li>";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";
        li.setAttribute("data-id", task.id);
        li.setAttribute("draggable", "true");
        li.setAttribute("data-priority", task.priority || "Medium");
        li.setAttribute("data-status", task.status || "To Do");

        li.innerHTML = `
            <div class="task-header">
                <span class="task-title ${task.priority.toLowerCase()}">${task.title}</span>
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

        elements.tasksContainer.appendChild(li);
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
            credentials: 'include',
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
        if (elements.calendarView && !elements.calendarView.classList.contains("hidden")) initializeCalendar(tasks);
        if (elements.timelineView && !elements.timelineView.classList.contains("hidden")) renderTimelineChart(tasks);
        if (elements.analyticsView && !elements.analyticsView.classList.contains("hidden")) renderAnalytics(tasks);
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
            credentials: 'include',
            body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const tasks = await fetchTasks();
        
        // Refresh views that might be affected
        if (elements.calendarView && !elements.calendarView.classList.contains("hidden")) initializeCalendar(tasks);
        if (elements.timelineView && !elements.timelineView.classList.contains("hidden")) renderTimelineChart(tasks);
        if (elements.analyticsView && !elements.analyticsView.classList.contains("hidden")) renderAnalytics(tasks);
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
            credentials: 'include',
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const tasks = await fetchTasks();
        
        // Refresh views that might be affected
        if (elements.calendarView && !elements.calendarView.classList.contains("hidden")) initializeCalendar(tasks);
        if (elements.timelineView && !elements.timelineView.classList.contains("hidden")) renderTimelineChart(tasks);
        if (elements.analyticsView && !elements.analyticsView.classList.contains("hidden")) renderAnalytics(tasks);
    } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task.");
    }
}

async function updateProgress(taskId) {
    console.log('Starting progress update for task:', taskId);
    let taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    if (!taskElement){
        console.error('Task element not found');
        await fetchTasks();
        return;
    }
    taskElement.style.opacity = "0.7"; 
    const newProgress = prompt("Enter progress percentage (0-100):");
    if (newProgress === null) {
        taskElement.style.opacity = "1";
        return;
    }

    const progressValue = parseInt(newProgress);
    if (isNaN(progressValue)) {
        console.error('Invalid progress value:', newProgress);
        alert("Please enter a valid number");
        taskElement.style.opacity = "1";
        return;
    }
    if (progressValue < 0 || progressValue > 100) {
        console.error('Progress out of range:', progressValue);
        alert("Progress must be between 0 and 100");
        taskElement.style.opacity = "1";
        return;
    }

    try {
        console.log('Attempting to update progress to:', progressValue);
        const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}/progress`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({ progress: progressValue })
        });
        console.log('Update response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Update failed:', errorData);
            // If unauthorized, try refreshing auth status
            if (response.status === 401) {
                const isAuthenticated = await checkAuthStatus();
                if (!isAuthenticated) {
                    alert('Session expired. Please login again.');
                    window.location.href = '/login';
                    return;
                }
                // Retry the request if now authenticated
                console.log('Retrying progress update after auth refresh');
                return updateProgress(taskId);
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        if (progressValue === 100) {
            console.log('Progress is 100%, updating status to Done');
            await updateTaskStatus(taskId, "Done");
        }
        
        taskElement.querySelector('.progress-bar').style.width = `${progressValue}%`;
        taskElement.querySelector('.progress-text').textContent = `${progressValue}%`;
        taskElement.style.opacity = "1";

        const tasks = await fetchTasks();

        if (elements.calendarView && !elements.calendarView.classList.contains("hidden")) initializeCalendar(tasks);
        if (elements.timelineView && !elements.timelineView.classList.contains("hidden")) renderTimelineChart(tasks);
        if (elements.analyticsView && !elements.analyticsView.classList.contains("hidden")) renderAnalytics(tasks);
    } catch (error) {
        console.error("Error updating progress:", error);
        alert(`Failed to update progress: ${error.message}`);
        taskElement.style.opacity = "1";
    }
}

// Subtask Functions
function showAddSubtaskForm(taskId) {
    if (!elements.addSubtaskSection) return;
    
    document.getElementById("subtaskTaskId").value = taskId;
    elements.addSubtaskSection.classList.remove("hidden");
    
    // Add explanation text
    const explanation = document.createElement('p');
    explanation.className = 'subtask-explanation';
    explanation.textContent = 'Subtasks help break your task into smaller, manageable steps. Add as many as you need.';
    
    // Insert the explanation at the top of the form
    if (!elements.addSubtaskSection.querySelector('.subtask-explanation')) {
        elements.addSubtaskSection.insertBefore(explanation, elements.addSubtaskSection.firstChild);
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
            credentials: 'include',
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
        if (elements.addSubtaskSection) {
            elements.addSubtaskSection.classList.add("hidden");
        }
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
            credentials: 'include',
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
    if (!elements.tasksContainer) return;
    
    let draggedTask = null;

    elements.tasksContainer.addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("task-item")) {
            draggedTask = e.target;
            e.target.style.opacity = "0.5";
        }
    });

    elements.tasksContainer.addEventListener("dragend", (e) => {
        if (e.target.classList.contains("task-item")) {
            e.target.style.opacity = "1";
            draggedTask = null;
        }
    });

    elements.tasksContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!draggedTask) return;
        
        const afterElement = getDragAfterElement(elements.tasksContainer, e.clientY);
        if (afterElement == null) {
            elements.tasksContainer.appendChild(draggedTask);
        } else {
            elements.tasksContainer.insertBefore(draggedTask, afterElement);
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

// Calendar View
function initializeCalendar(tasks) {
    if (!elements.calendarEl) return;
    
    // Clear any existing calendar
    elements.calendarEl.innerHTML = '';
    
    // Process tasks for calendar display
    const calendarTasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        start: task.startDate ? new Date(task.startDate) : null,
        end: task.endDate ? new Date(task.endDate) : null,
        extendedProps: {
            description: task.description || 'No description',
            status: task.status || 'To Do',
            priority: task.priority || 'Medium',
            progress: task.progress || 0,
            hasSubtasks: false // Will be updated after fetching subtasks
        },
        color: getPriorityColor(task.priority || 'Medium'),
        allDay: true // Make all events all-day for better display
    }));

    // Create the calendar instance
    const calendar = new FullCalendar.Calendar(elements.calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: calendarTasks.filter(event => event.start && event.end),
        editable: true, // Enable drag-and-drop
        selectable: true,
        selectOverlap: false, // Prevent overlapping events
        eventOverlap: false, // Don't allow events to overlap
        eventConstraint: {
            startTime: '00:00',
            endTime: '24:00',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // All days
        },
        
        // Enhanced event rendering with subtasks
        eventDidMount: async function(info) {
            // Fetch subtasks for this task
            const subtasks = await fetchSubtasks(info.event.id);
            info.event.extendedProps.hasSubtasks = subtasks.length > 0;
            
            // Create custom tooltip with subtask information
            const tooltip = document.createElement('div');
            tooltip.className = 'calendar-tooltip';
            
            // Build subtasks HTML if any exist
            const subtasksHtml = subtasks.length > 0 
                ? `<div class="subtasks-tooltip">
                     <strong>Subtasks (${subtasks.filter(st => st.completed).length}/${subtasks.length}):</strong>
                     <ul>${subtasks.map(st => 
                         `<li class="${st.completed ? 'completed' : ''}">${st.title}</li>`
                     ).join('')}</ul>
                   </div>`
                : '';
            
            tooltip.innerHTML = `
                <div class="tooltip-header ${info.event.extendedProps.priority.toLowerCase()}">
                    ${info.event.title}
                    ${info.event.extendedProps.hasSubtasks ? '<span class="subtask-indicator">📋</span>' : ''}
                </div>
                <div class="tooltip-body">
                    <p><strong>Description:</strong> ${info.event.extendedProps.description}</p>
                    <p><strong>Status:</strong> ${info.event.extendedProps.status}</p>
                    <p><strong>Priority:</strong> ${info.event.extendedProps.priority}</p>
                    <p><strong>Progress:</strong> ${info.event.extendedProps.progress}%</p>
                    <p><strong>Dates:</strong> ${info.event.start?.toLocaleDateString() || 'No start'} - ${info.event.end?.toLocaleDateString() || 'No end'}</p>
                    ${subtasksHtml}
                </div>
            `;
            
            // Add subtask indicator to calendar event if there are subtasks
            if (info.event.extendedProps.hasSubtasks) {
                const dot = document.createElement('div');
                dot.className = 'subtask-dot';
                info.el.querySelector('.fc-event-title').prepend(dot);
            }
            
            // Position and show tooltip on hover
            info.el.addEventListener('mouseenter', (e) => {
                document.body.appendChild(tooltip);
                
                // Calculate position with viewport boundaries in mind
                const rect = info.el.getBoundingClientRect();
                let left = rect.left + window.scrollX;
                let top = rect.top + window.scrollY - tooltip.offsetHeight - 10;
                
                // Adjust if tooltip would go off screen
                if (top < 0) top = rect.bottom + window.scrollY + 5;
                if (left + tooltip.offsetWidth > window.innerWidth) {
                    left = window.innerWidth - tooltip.offsetWidth - 10;
                }
                
                tooltip.style.position = 'absolute';
                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
                tooltip.style.opacity = '1';
                tooltip.style.zIndex = '1000';
                
                // Add class to prevent blinking
                info.el.classList.add('has-tooltip');
            });
            
            // Remove tooltip when mouse leaves
            info.el.addEventListener('mouseleave', () => {
                if (document.body.contains(tooltip)) {
                    tooltip.style.opacity = '0';
                    setTimeout(() => {
                        if (document.body.contains(tooltip)) {
                            document.body.removeChild(tooltip);
                        }
                    }, 200);
                }
                info.el.classList.remove('has-tooltip');
            });
        },
        
        // Handle event drop (drag-and-drop rescheduling)
        eventDrop: async function(info) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/tasks/${info.event.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify({
                        startDate: info.event.start.toISOString(),
                        endDate: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString()
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to update task dates');
                }
                
                showSuccessMessage('Task rescheduled successfully!');
            } catch (error) {
                console.error('Error rescheduling task:', error);
                info.revert(); // Revert the event if update fails
                alert('Failed to reschedule task. Please try again.');
            }
        },
        
        // Handle event resize (duration change)
        eventResize: async function(info) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/tasks/${info.event.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify({
                        endDate: info.event.end.toISOString()
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to update task duration');
                }
                
                showSuccessMessage('Task duration updated successfully!');
            } catch (error) {
                console.error('Error updating task duration:', error);
                info.revert(); // Revert the resize if update fails
                alert('Failed to update task duration. Please try again.');
            }
        },
        
        // Handle event click (show details modal)
        eventClick: function(info) {
            showTaskDetailsModal(info.event);
        }
    });
    
    // Render the calendar
    calendar.render();
    
    // Add filters for calendar view
    addCalendarFilters(calendar, tasks);
}

// Show detailed task modal with subtasks
function showTaskDetailsModal(event) {
    const modal = document.createElement('div');
    modal.className = 'task-details-modal';
    
    // Fetch subtasks for this task
    fetchSubtasks(event.id).then(subtasks => {
        const subtasksHtml = subtasks.length > 0 
            ? `<div class="modal-subtasks">
                 <h4>Subtasks (${subtasks.filter(st => st.completed).length}/${subtasks.length} completed)</h4>
                 <ul>${subtasks.map(st => `
                     <li class="${st.completed ? 'completed' : ''}">
                         <input type="checkbox" ${st.completed ? 'checked' : ''} 
                                onchange="toggleSubtaskCompletion(${st.id}, this.checked)">
                         <span>${st.title}</span>
                         ${st.description ? `<p class="subtask-desc">${st.description}</p>` : ''}
                     </li>
                 `).join('')}</ul>
               </div>`
            : '';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>${event.title}</h3>
                <div class="modal-priority ${event.extendedProps.priority.toLowerCase()}">
                    Priority: ${event.extendedProps.priority}
                </div>
                <div class="modal-progress">
                    <div class="progress-bar" style="width: ${event.extendedProps.progress}%"></div>
                    <span>${event.extendedProps.progress}% complete</span>
                </div>
                <p><strong>Status:</strong> ${event.extendedProps.status}</p>
                <p><strong>Description:</strong> ${event.extendedProps.description || 'None'}</p>
                <p><strong>Start:</strong> ${event.start?.toLocaleDateString() || 'Not set'}</p>
                <p><strong>End:</strong> ${event.end?.toLocaleDateString() || 'Not set'}</p>
                ${subtasksHtml}
                <div class="modal-actions">
                    <button class="edit-task" data-id="${event.id}">Edit Task</button>
                    <button class="delete-task" data-id="${event.id}">Delete Task</button>
                    <button class="add-subtask" data-id="${event.id}">Add Subtask</button>
                </div>
            </div>
        `;
        
        // Add event listeners for modal buttons
        modal.querySelector('.edit-task').addEventListener('click', () => {
            modal.remove();
            editTask(event.id);
        });
        
        modal.querySelector('.delete-task').addEventListener('click', () => {
            modal.remove();
            deleteTask(event.id);
        });
        
        modal.querySelector('.add-subtask').addEventListener('click', () => {
            modal.remove();
            showAddSubtaskForm(event.id);
        });
        
        document.body.appendChild(modal);
        
        // Close modal handlers
        modal.querySelector('.close-modal').onclick = () => {
            document.body.removeChild(modal);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    });
}

// Timeline View
function renderTimelineChart(tasks) {
    if (!elements.timelineView) return;
    
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

// Analytics View
function renderAnalytics(tasks) {
    if (!elements.analyticsView) return;

    if (!tasks || tasks.length === 0) {
        elements.analyticsView.innerHTML = "<p>No tasks available for analytics</p>";
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
                const duration = Math.max(0.5, (end - start) / (1000 * 60 * 60 * 24));
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

function renderPieChart(elementId, labels, data, colors, title, tooltipLabels) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return null;
    
    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();
    
    return new Chart(ctx, {
        type: 'pie',
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
            plugins: { 
                legend: { 
                    position: 'bottom',
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return tooltipLabels ? tooltipLabels[context.dataIndex] : context.label;
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

// Utility Functions
function getPriorityColor(priority) {
    switch(priority) {
        case 'High': return '#ff4444';
        case 'Medium': return '#ffbb33';
        case 'Low': return '#00C851';
        default: return '#3a87ad';
    }
}
