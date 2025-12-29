// Calendar View Module

import { formatDate } from './utils.js';

let currentViewDate = new Date();
let calendarVisible = false;

/**
 * Initialize calendar view
 */
export function initCalendar() {
  const calendarToggle = document.getElementById('calendar-toggle');
  if (calendarToggle) {
    calendarToggle.addEventListener('click', toggleCalendarView);
  }

  // Calendar navigation buttons
  const prevMonth = document.getElementById('calendar-prev');
  const nextMonth = document.getElementById('calendar-next');
  const todayBtn = document.getElementById('calendar-today');

  if (prevMonth) prevMonth.addEventListener('click', () => navigateMonth(-1));
  if (nextMonth) nextMonth.addEventListener('click', () => navigateMonth(1));
  if (todayBtn) todayBtn.addEventListener('click', goToToday);
}

/**
 * Toggle calendar view visibility
 */
function toggleCalendarView() {
  calendarVisible = !calendarVisible;
  const calendarContainer = document.getElementById('calendar-container');
  const taskListContainer = document.querySelector('.task-list-container');
  const calendarToggle = document.getElementById('calendar-toggle');

  if (calendarContainer && taskListContainer) {
    if (calendarVisible) {
      calendarContainer.hidden = false;
      taskListContainer.hidden = true;
      if (calendarToggle) calendarToggle.textContent = 'Show Task List';
      renderCalendar();
    } else {
      calendarContainer.hidden = true;
      taskListContainer.hidden = false;
      if (calendarToggle) calendarToggle.textContent = 'Show Calendar';
    }
  }
}

/**
 * Navigate months
 * @param {number} offset - Month offset (-1 or 1)
 */
function navigateMonth(offset) {
  currentViewDate.setMonth(currentViewDate.getMonth() + offset);
  renderCalendar();
}

/**
 * Go to today's date
 */
function goToToday() {
  currentViewDate = new Date();
  renderCalendar();
}

/**
 * Render calendar view
 * @param {Array} tasks - All tasks
 */
export function renderCalendar(tasks = []) {
  if (!calendarVisible) return;

  const calendarGrid = document.getElementById('calendar-grid');
  const monthYear = document.getElementById('calendar-month-year');

  if (!calendarGrid || !monthYear) return;

  // Update month/year display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  monthYear.textContent = `${monthNames[currentViewDate.getMonth()]} ${currentViewDate.getFullYear()}`;

  // Clear grid
  calendarGrid.innerHTML = '';

  // Add day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = day;
    calendarGrid.appendChild(header);
  });

  // Get first day of month and number of days
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyCell);
  }

  // Add day cells
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayCell = createDayCell(day, dateStr, todayStr, tasks);
    calendarGrid.appendChild(dayCell);
  }
}

/**
 * Create a single day cell
 * @param {number} day - Day number
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} todayStr - Today's date string
 * @param {Array} tasks - All tasks
 * @returns {HTMLElement} Day cell element
 */
function createDayCell(day, dateStr, todayStr, tasks) {
  const cell = document.createElement('div');
  cell.className = 'calendar-day';
  cell.setAttribute('data-date', dateStr);

  // Check if today
  if (dateStr === todayStr) {
    cell.classList.add('today');
  }

  // Day number
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = day;
  cell.appendChild(dayNumber);

  // Find tasks for this date
  const dayTasks = tasks.filter(t => t.dueDate === dateStr && !t.parentId);

  if (dayTasks.length > 0) {
    cell.classList.add('has-tasks');

    // Show task indicators (max 3, then "+X more")
    const taskIndicators = document.createElement('div');
    taskIndicators.className = 'task-indicators';

    const displayTasks = dayTasks.slice(0, 3);
    displayTasks.forEach(task => {
      const indicator = document.createElement('div');
      indicator.className = `task-indicator priority-${task.priority}`;
      indicator.textContent = task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title;
      indicator.title = task.title;
      taskIndicators.appendChild(indicator);
    });

    if (dayTasks.length > 3) {
      const moreIndicator = document.createElement('div');
      moreIndicator.className = 'task-indicator more';
      moreIndicator.textContent = `+${dayTasks.length - 3} more`;
      taskIndicators.appendChild(moreIndicator);
    }

    cell.appendChild(taskIndicators);
  }

  // Click handler to show tasks for this day
  cell.addEventListener('click', () => {
    showDayTasks(dateStr, dayTasks);
  });

  return cell;
}

/**
 * Show tasks for a specific day in a modal or side panel
 * @param {string} dateStr - Date string
 * @param {Array} tasks - Tasks for this day
 */
function showDayTasks(dateStr, tasks) {
  // Emit custom event that app.js can listen to
  const event = new CustomEvent('calendarDayClicked', {
    detail: { date: dateStr, tasks }
  });
  document.dispatchEvent(event);
}

/**
 * Check if calendar is visible
 * @returns {boolean} True if calendar is visible
 */
export function isCalendarVisible() {
  return calendarVisible;
}
