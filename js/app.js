// Application Entry Point and Bootstrap

import { initStorage, checkStorageAvailability, getSettings, saveSettings, getTasks, saveTasks, exportTasks, importTasks } from './storage.js';
import { createTask, updateTask, deleteTask, toggleTaskStatus, createSubtask, updateParentTaskProgress, toggleTaskStatusWithRecurrence } from './taskManager.js';
import { filterAndSortTasks } from './filters.js';
import { calculateStatistics } from './statistics.js';
import {
  renderTaskList,
  renderStatistics,
  updateFilterUI,
  getFormData,
  getEditingTaskId,
  clearForm,
  populateFormForEdit,
  showError,
  showSuccess
} from './ui.js';
import { announce, initKeyboardNavigation } from './accessibility.js';
import { getTodayDateString } from './utils.js';
import { initTheme, setupThemeToggle } from './theme.js';
import { initNotificationChecking, setupNotificationToggle } from './notifications.js';
import { initDragDrop, makeTasksDraggable, reorderTasks } from './dragDrop.js';

// Application state
let currentFilter = 'all';
let currentPriorityFilter = 'all';
let currentSortBy = 'dueDate';
let currentSortOrder = 'asc';

/**
 * Initialize application
 */
function init() {
  // Check localStorage availability
  if (!checkStorageAvailability()) {
    showError('localStorage is not available. The app may not work correctly.');
    return;
  }

  // Initialize storage
  initStorage();

  // Initialize theme
  initTheme();

  // Load saved settings
  loadSettings();

  // Set min date for due date input (today)
  const dueDateInput = document.getElementById('task-due-date');
  if (dueDateInput) {
    dueDateInput.min = getTodayDateString();
  }

  // Initialize event listeners
  initEventListeners();

  // Setup theme toggle
  setupThemeToggle();

  // Setup notification toggle
  setupNotificationToggle();

  // Initialize notification checking
  initNotificationChecking(getTasks);

  // Initialize keyboard navigation
  initKeyboardNavigation();

  // Initialize drag and drop
  initDragDrop();

  // Listen for task reorder events
  document.addEventListener('tasksReordered', handleTasksReordered);

  // Initial render
  refreshApp();

  console.log('Task Manager initialized successfully');
}

/**
 * Load saved settings from storage
 */
function loadSettings() {
  const settings = getSettings();

  if (settings.lastFilter) {
    currentFilter = settings.lastFilter;
  }

  if (settings.sortBy) {
    currentSortBy = settings.sortBy;
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
      sortSelect.value = currentSortBy;
    }
  }

  if (settings.sortOrder) {
    currentSortOrder = settings.sortOrder;
  }
}

/**
 * Save current settings to storage
 */
function persistSettings() {
  saveSettings({
    lastFilter: currentFilter,
    sortBy: currentSortBy,
    sortOrder: currentSortOrder
  });
}

/**
 * Initialize all event listeners
 */
function initEventListeners() {
  // Form submission
  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', handleFormSubmit);
  }

  // Cancel edit button
  const cancelBtn = document.getElementById('cancel-edit');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', handleCancelEdit);
  }

  // Task list event delegation
  const taskList = document.getElementById('task-list');
  if (taskList) {
    taskList.addEventListener('click', handleTaskListClick);
    taskList.addEventListener('change', handleTaskListChange);
  }

  // Subtask event delegation (for dynamically added subtask containers)
  document.addEventListener('click', handleSubtaskClick);
  document.addEventListener('change', handleSubtaskChange);

  // Status filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', handleStatusFilterChange);
  });

  // Priority filter
  const priorityFilter = document.getElementById('priority-filter');
  if (priorityFilter) {
    priorityFilter.addEventListener('change', handlePriorityFilterChange);
  }

  // Sort controls
  const sortBy = document.getElementById('sort-by');
  if (sortBy) {
    sortBy.addEventListener('change', handleSortChange);
  }

  // Export button
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportTasks);
  }

  // Import file input
  const importFile = document.getElementById('import-file');
  if (importFile) {
    importFile.addEventListener('change', handleImportTasks);
  }

  // Recurring toggle
  const recurringToggle = document.getElementById('recurring-toggle');
  if (recurringToggle) {
    recurringToggle.addEventListener('change', handleRecurringToggle);
  }
}

/**
 * Handle recurring toggle change
 * @param {Event} event - Change event
 */
function handleRecurringToggle(event) {
  const recurringOptions = document.getElementById('recurring-options');
  if (recurringOptions) {
    recurringOptions.hidden = !event.target.checked;
  }
}

/**
 * Handle form submission (create or update task)
 * @param {Event} event - Submit event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const formData = getFormData();
  const editingTaskId = getEditingTaskId();

  try {
    if (editingTaskId) {
      // Update existing task
      updateTask(editingTaskId, formData);
      showSuccess('Task updated successfully');
      announce('Task updated');
    } else {
      // Create new task
      const newTask = createTask(formData);
      showSuccess('Task added successfully');
      announce('Task added');
    }

    // Clear form and refresh
    clearForm();
    refreshApp();
  } catch (error) {
    console.error('Error saving task:', error);
    showError(error.message || 'Failed to save task');
    announce(error.message || 'Failed to save task', 'assertive');
  }
}

/**
 * Handle cancel edit button
 */
function handleCancelEdit() {
  clearForm();
  announce('Edit cancelled');
}

/**
 * Handle clicks on task list (edit, delete, add-subtask buttons)
 * @param {Event} event - Click event
 */
function handleTaskListClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;
  const taskItem = target.closest('.task-item');
  const taskId = taskItem.dataset.taskId;

  switch (action) {
    case 'edit':
      handleEditTask(taskId);
      break;
    case 'delete':
      handleDeleteTask(taskId);
      break;
    case 'add-subtask':
      handleAddSubtask(taskId);
      break;
  }
}

/**
 * Handle changes on task list (checkbox toggles)
 * @param {Event} event - Change event
 */
function handleTaskListChange(event) {
  if (event.target.type === 'checkbox') {
    const taskItem = event.target.closest('.task-item');
    const taskId = taskItem.dataset.taskId;
    handleToggleTaskStatus(taskId);
  }
}

/**
 * Handle edit task action
 * @param {string} taskId - Task ID
 */
function handleEditTask(taskId) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);

  if (task) {
    populateFormForEdit(task);
    announce(`Editing task: ${task.title}`);

    // Scroll to form
    const form = document.getElementById('task-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

/**
 * Handle delete task action
 * @param {string} taskId - Task ID
 */
function handleDeleteTask(taskId) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);

  if (!task) return;

  const confirmed = confirm(`Are you sure you want to delete "${task.title}"?`);

  if (confirmed) {
    try {
      deleteTask(taskId);
      showSuccess('Task deleted successfully');
      announce('Task deleted');
      refreshApp();
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task');
      announce('Failed to delete task', 'assertive');
    }
  }
}

/**
 * Handle toggle task completion status
 * @param {string} taskId - Task ID
 */
function handleToggleTaskStatus(taskId) {
  try {
    const task = getTasks().find(t => t.id === taskId);

    // Use toggleTaskStatusWithRecurrence for recurring tasks
    const result = toggleTaskStatusWithRecurrence(taskId);
    const updatedTask = result.updatedTask;
    const nextTask = result.nextTask;

    // If this is a subtask, update parent progress
    if (task && task.parentId) {
      updateParentTaskProgress(task.parentId);
    }

    const statusText = updatedTask.status === 'completed' ? 'completed' : 'active';
    announce(`Task marked as ${statusText}`);

    // Show message if next recurrence was created
    if (nextTask) {
      showSuccess(`Task completed! Next occurrence created for ${nextTask.dueDate}`);
    }

    refreshApp();
  } catch (error) {
    console.error('Error toggling task status:', error);
    showError('Failed to update task status');
    announce('Failed to update task status', 'assertive');
  }
}

/**
 * Handle add subtask action
 * @param {string} parentId - Parent task ID
 */
function handleAddSubtask(parentId) {
  const subtaskTitle = prompt('Enter subtask title:');

  if (!subtaskTitle || subtaskTitle.trim().length === 0) {
    return;
  }

  try {
    createSubtask(parentId, {
      title: subtaskTitle.trim(),
      priority: 'medium'
    });
    showSuccess('Subtask added successfully');
    announce('Subtask added');
    refreshApp();
  } catch (error) {
    console.error('Error creating subtask:', error);
    showError(error.message || 'Failed to create subtask');
    announce(error.message || 'Failed to create subtask', 'assertive');
  }
}

/**
 * Handle clicks on subtask elements
 * @param {Event} event - Click event
 */
function handleSubtaskClick(event) {
  const subtaskItem = event.target.closest('.subtask-item');
  if (!subtaskItem) return;

  const target = event.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;
  const taskId = subtaskItem.dataset.taskId;

  switch (action) {
    case 'edit':
      handleEditTask(taskId);
      break;
    case 'delete':
      handleDeleteTask(taskId);
      break;
  }
}

/**
 * Handle changes on subtask checkboxes
 * @param {Event} event - Change event
 */
function handleSubtaskChange(event) {
  const subtaskItem = event.target.closest('.subtask-item');
  if (!subtaskItem || event.target.type !== 'checkbox') return;

  const taskId = subtaskItem.dataset.taskId;
  handleToggleTaskStatus(taskId);
}

/**
 * Handle status filter change
 * @param {Event} event - Click event
 */
function handleStatusFilterChange(event) {
  const filter = event.target.dataset.filter;
  if (filter) {
    currentFilter = filter;
    updateFilterUI(currentFilter);
    persistSettings();
    refreshApp();
    announce(`Showing ${filter} tasks`);
  }
}

/**
 * Handle priority filter change
 * @param {Event} event - Change event
 */
function handlePriorityFilterChange(event) {
  currentPriorityFilter = event.target.value;
  refreshApp();
  announce(`Filtering by ${currentPriorityFilter} priority`);
}

/**
 * Handle sort change
 * @param {Event} event - Change event
 */
function handleSortChange(event) {
  currentSortBy = event.target.value;
  persistSettings();
  refreshApp();
  announce(`Sorting by ${currentSortBy}`);
}

/**
 * Refresh the entire application view
 */
function refreshApp() {
  const allTasks = getTasks();

  // Apply filters and sorting
  const filters = {
    status: currentFilter,
    priority: currentPriorityFilter
  };

  const filteredAndSortedTasks = filterAndSortTasks(
    allTasks,
    filters,
    currentSortBy,
    currentSortOrder
  );

  // Render tasks
  renderTaskList(filteredAndSortedTasks);

  // Make tasks draggable
  const taskList = document.getElementById('task-list');
  if (taskList) {
    makeTasksDraggable(taskList);
  }

  // Calculate and render statistics (always based on all tasks)
  const stats = calculateStatistics(allTasks);
  renderStatistics(stats);

  // Update filter UI
  updateFilterUI(currentFilter);
}

/**
 * Handle tasks reordered event
 * @param {CustomEvent} event - Reorder event
 */
function handleTasksReordered(event) {
  try {
    const newOrder = event.detail.getNewOrder();
    const allTasks = getTasks();

    // Reorder tasks based on new DOM order
    const reorderedTasks = reorderTasks(allTasks, newOrder);

    // Save to storage
    saveTasks(reorderedTasks);

    announce('Tasks reordered');
  } catch (error) {
    console.error('Error reordering tasks:', error);
    showError('Failed to save new order');
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential external use
export { refreshApp };

/**
 * Handle export tasks
 */
function handleExportTasks() {
  const tasks = getTasks();
  exportTasks(tasks);
  showSuccess(`Exported ${tasks.length} tasks`);
  announce(`${tasks.length} tasks exported`);
}

/**
 * Handle import tasks
 * @param {Event} event - Change event
 */
async function handleImportTasks(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const importCount = await importTasks(file);
    showSuccess(`Imported ${importCount} new tasks`);
    announce(`${importCount} tasks imported`);
    refreshApp();
  } catch (error) {
    console.error('Import error:', error);
    showError(error.message);
    announce(error.message, 'assertive');
  } finally {
    // Clear the file input so the same file can be imported again
    event.target.value = '';
  }
}
