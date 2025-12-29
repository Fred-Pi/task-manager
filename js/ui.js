// UI Rendering Module

import { formatDate, isOverdue, escapeHtml } from './utils.js';
import { updateTaskAriaLabel } from './accessibility.js';

/**
 * Render task list to DOM
 * @param {Array} tasks - Array of tasks to render
 */
export function renderTaskList(tasks) {
  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');

  if (!taskList) return;

  // Clear existing tasks
  taskList.innerHTML = '';

  // Show/hide empty state
  if (tasks.length === 0) {
    if (emptyState) {
      emptyState.style.display = 'block';
    }
    taskList.style.display = 'none';
    return;
  }

  if (emptyState) {
    emptyState.style.display = 'none';
  }
  taskList.style.display = 'block';

  // Render each task
  const fragment = document.createDocumentFragment();
  tasks.forEach(task => {
    const taskElement = createTaskElement(task);
    fragment.appendChild(taskElement);
  });

  taskList.appendChild(fragment);
}

/**
 * Create a single task element
 * @param {Object} task - Task object
 * @returns {HTMLElement} Task list item element
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
  li.setAttribute('data-task-id', task.id);
  li.setAttribute('data-priority', task.priority);

  // Check if overdue
  const overdueClass = task.status === 'active' && isOverdue(task.dueDate) ? ' overdue' : '';
  if (overdueClass) {
    li.classList.add('overdue');
  }

  // Build task HTML
  li.innerHTML = `
    <div class="task-checkbox">
      <input
        type="checkbox"
        id="checkbox-${task.id}"
        ${task.status === 'completed' ? 'checked' : ''}
        aria-label="Mark task as ${task.status === 'completed' ? 'incomplete' : 'complete'}"
      />
      <label for="checkbox-${task.id}"></label>
    </div>

    <div class="task-content">
      <h3 class="task-title">${escapeHtml(task.title)}</h3>
      <div class="task-meta">
        <span class="task-priority" aria-label="Priority: ${task.priority}">
          <span class="priority-badge priority-badge--${task.priority}">${task.priority}</span>
        </span>
        ${task.dueDate ? `
          <span class="task-due-date ${isOverdue(task.dueDate) && task.status === 'active' ? 'overdue' : ''}"
                aria-label="Due date: ${formatDate(task.dueDate)}">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${formatDate(task.dueDate)}
          </span>
        ` : ''}
      </div>
      ${task.tags && task.tags.length > 0 ? `
        <div class="task-tags">
          ${task.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
    </div>

    <div class="task-actions">
      <button
        type="button"
        class="btn-icon"
        aria-label="Edit task: ${escapeHtml(task.title)}"
        data-action="edit"
      >
        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button
        type="button"
        class="btn-icon btn-danger"
        aria-label="Delete task: ${escapeHtml(task.title)}"
        data-action="delete"
      >
        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  `;

  // Update ARIA label for screen readers
  updateTaskAriaLabel(li, task);

  return li;
}

/**
 * Render statistics to dashboard
 * @param {Object} stats - Statistics object
 */
export function renderStatistics(stats) {
  // Update stat values
  updateStatValue('stat-total', stats.total);
  updateStatValue('stat-active', stats.active);
  updateStatValue('stat-completed', stats.completed);
  updateStatValue('stat-completion-rate', `${stats.completionRate}%`);
  updateStatValue('stat-overdue', stats.overdue);

  // Update overdue card warning state
  const overdueCard = document.querySelector('.stat-card--warning');
  if (overdueCard) {
    if (stats.overdue > 0) {
      overdueCard.classList.add('has-overdue');
    } else {
      overdueCard.classList.remove('has-overdue');
    }
  }
}

/**
 * Update a single stat value
 * @param {string} id - Element ID
 * @param {string|number} value - Value to display
 */
function updateStatValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

/**
 * Update filter UI state
 * @param {string} activeFilter - Currently active filter
 */
export function updateFilterUI(activeFilter) {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(btn => {
    const isActive = btn.dataset.filter === activeFilter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

/**
 * Populate form with task data for editing
 * @param {Object} task - Task object
 */
export function populateFormForEdit(task) {
  const form = document.getElementById('task-form');
  const titleInput = document.getElementById('task-title');
  const prioritySelect = document.getElementById('task-priority');
  const dueDateInput = document.getElementById('task-due-date');
  const tagsInput = document.getElementById('task-tags');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-edit');

  if (!form) return;

  // Store task ID on form
  form.dataset.editingTaskId = task.id;

  // Populate fields
  if (titleInput) titleInput.value = task.title;
  if (prioritySelect) prioritySelect.value = task.priority;
  if (dueDateInput) dueDateInput.value = task.dueDate || '';
  if (tagsInput) tagsInput.value = task.tags ? task.tags.join(', ') : '';

  // Update button states
  if (submitBtn) {
    const btnText = submitBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Update Task';
  }

  if (cancelBtn) {
    cancelBtn.hidden = false;
  }

  // Focus on title input
  if (titleInput) {
    titleInput.focus();
    titleInput.select();
  }
}

/**
 * Clear form and reset to add mode
 */
export function clearForm() {
  const form = document.getElementById('task-form');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-edit');

  if (!form) return;

  // Clear form
  form.reset();

  // Remove edit mode data
  delete form.dataset.editingTaskId;

  // Update button states
  if (submitBtn) {
    const btnText = submitBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Add Task';
  }

  if (cancelBtn) {
    cancelBtn.hidden = true;
  }
}

/**
 * Get form data
 * @returns {Object} Form data object
 */
export function getFormData() {
  const titleInput = document.getElementById('task-title');
  const prioritySelect = document.getElementById('task-priority');
  const dueDateInput = document.getElementById('task-due-date');
  const tagsInput = document.getElementById('task-tags');

  // Parse tags from comma-separated string
  let tags = [];
  if (tagsInput && tagsInput.value.trim()) {
    tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && tag.length <= 20);
  }

  return {
    title: titleInput ? titleInput.value.trim() : '',
    priority: prioritySelect ? prioritySelect.value : 'medium',
    dueDate: dueDateInput && dueDateInput.value ? dueDateInput.value : null,
    tags
  };
}

/**
 * Check if form is in edit mode
 * @returns {string|null} Task ID being edited or null
 */
export function getEditingTaskId() {
  const form = document.getElementById('task-form');
  return form && form.dataset.editingTaskId ? form.dataset.editingTaskId : null;
}

/**
 * Show loading state
 */
export function showLoading() {
  const taskList = document.getElementById('task-list');
  if (taskList) {
    taskList.innerHTML = '<li class="loading">Loading tasks...</li>';
  }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
export function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-toast';
  errorDiv.textContent = message;
  errorDiv.setAttribute('role', 'alert');

  document.body.appendChild(errorDiv);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

/**
 * Show success message
 * @param {string} message - Success message
 */
export function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-toast';
  successDiv.textContent = message;
  successDiv.setAttribute('role', 'status');

  document.body.appendChild(successDiv);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

/**
 * Highlight a task temporarily
 * @param {string} taskId - Task ID to highlight
 */
export function highlightTask(taskId) {
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
  if (taskElement) {
    taskElement.classList.add('highlight');
    setTimeout(() => {
      taskElement.classList.remove('highlight');
    }, 2000);
  }
}
