// Drag and Drop Module

let draggedElement = null;
let draggedTaskId = null;

/**
 * Initialize drag and drop functionality
 */
export function initDragDrop() {
  const taskList = document.getElementById('task-list');
  if (!taskList) return;

  // Use event delegation for drag events
  taskList.addEventListener('dragstart', handleDragStart);
  taskList.addEventListener('dragend', handleDragEnd);
  taskList.addEventListener('dragover', handleDragOver);
  taskList.addEventListener('drop', handleDrop);
  taskList.addEventListener('dragenter', handleDragEnter);
  taskList.addEventListener('dragleave', handleDragLeave);
}

/**
 * Make task items draggable
 * @param {HTMLElement} taskList - Task list container
 */
export function makeTasksDraggable(taskList) {
  const taskItems = taskList.querySelectorAll('.task-item');

  taskItems.forEach(item => {
    item.setAttribute('draggable', 'true');
  });
}

/**
 * Handle drag start
 * @param {DragEvent} e - Drag event
 */
function handleDragStart(e) {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;

  draggedElement = taskItem;
  draggedTaskId = taskItem.dataset.taskId;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', taskItem.innerHTML);

  // Add dragging class after a slight delay to avoid flickering
  setTimeout(() => {
    if (draggedElement) {
      draggedElement.classList.add('dragging');
    }
  }, 0);
}

/**
 * Handle drag end
 * @param {DragEvent} e - Drag event
 */
function handleDragEnd(e) {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;

  taskItem.classList.remove('dragging');

  // Remove all drag-over classes
  document.querySelectorAll('.task-item').forEach(item => {
    item.classList.remove('drag-over');
  });

  draggedElement = null;
  draggedTaskId = null;
}

/**
 * Handle drag over
 * @param {DragEvent} e - Drag event
 */
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = 'move';
  return false;
}

/**
 * Handle drag enter
 * @param {DragEvent} e - Drag event
 */
function handleDragEnter(e) {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem || taskItem === draggedElement) return;

  taskItem.classList.add('drag-over');
}

/**
 * Handle drag leave
 * @param {DragEvent} e - Drag event
 */
function handleDragLeave(e) {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;

  taskItem.classList.remove('drag-over');
}

/**
 * Handle drop
 * @param {DragEvent} e - Drag event
 */
function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  const targetItem = e.target.closest('.task-item');
  if (!targetItem || !draggedElement || targetItem === draggedElement) {
    return false;
  }

  // Get the task list
  const taskList = document.getElementById('task-list');

  // Determine if we should insert before or after
  const bounding = targetItem.getBoundingClientRect();
  const offset = e.clientY - bounding.top;
  const insertBefore = offset < bounding.height / 2;

  if (insertBefore) {
    taskList.insertBefore(draggedElement, targetItem);
  } else {
    taskList.insertBefore(draggedElement, targetItem.nextSibling);
  }

  // Emit custom event to update task order in storage
  const reorderEvent = new CustomEvent('tasksReordered', {
    detail: { getNewOrder: () => getTaskOrder() }
  });
  document.dispatchEvent(reorderEvent);

  return false;
}

/**
 * Get current task order from DOM
 * @returns {Array} Array of task IDs in current order
 */
function getTaskOrder() {
  const taskItems = document.querySelectorAll('.task-item');
  return Array.from(taskItems).map(item => item.dataset.taskId);
}

/**
 * Update task order in storage
 * @param {Array} tasks - Array of all tasks
 * @param {Array} taskOrder - Array of task IDs in desired order
 * @returns {Array} Reordered tasks
 */
export function reorderTasks(tasks, taskOrder) {
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  const reordered = [];

  // Add tasks in the specified order
  taskOrder.forEach(id => {
    if (taskMap.has(id)) {
      reordered.push(taskMap.get(id));
      taskMap.delete(id);
    }
  });

  // Add any remaining tasks that weren't in the order (shouldn't happen, but safety)
  taskMap.forEach(task => {
    reordered.push(task);
  });

  return reordered;
}
