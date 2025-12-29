// Task Management Module - CRUD Operations

import { getTasks, saveTasks } from './storage.js';
import { generateId, sanitizeString, truncate, validateDate } from './utils.js';

/**
 * Create a new task
 * @param {Object} taskData - Task data object
 * @returns {Object} Created task
 */
export function createTask(taskData) {
  // Validate input
  if (!taskData.title || taskData.title.trim().length === 0) {
    throw new Error('Task title is required');
  }

  // Generate unique ID
  const id = generateId();

  // Create task object with defaults
  const task = {
    id,
    title: truncate(sanitizeString(taskData.title), 200),
    description: taskData.description ? sanitizeString(taskData.description) : '',
    priority: taskData.priority || 'medium',
    status: 'active',
    tags: taskData.tags || [],
    dueDate: taskData.dueDate ? validateDate(taskData.dueDate) : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  };

  // Validate priority
  if (!['low', 'medium', 'high'].includes(task.priority)) {
    task.priority = 'medium';
  }

  // Save to storage
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);

  return task;
}

/**
 * Get all tasks with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Array} Array of tasks
 */
export function getAllTasks(filters = {}) {
  let tasks = getTasks();

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    tasks = tasks.filter(t => t.status === filters.status);
  }

  // Apply priority filter
  if (filters.priority && filters.priority !== 'all') {
    tasks = tasks.filter(t => t.priority === filters.priority);
  }

  return tasks;
}

/**
 * Get a single task by ID
 * @param {string} id - Task ID
 * @returns {Object|null} Task object or null
 */
export function getTaskById(id) {
  const tasks = getTasks();
  return tasks.find(t => t.id === id) || null;
}

/**
 * Update an existing task
 * @param {string} id - Task ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated task
 */
export function updateTask(id, updates) {
  const tasks = getTasks();

  // Find task index
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  // Validate updates
  if (updates.title !== undefined) {
    if (!updates.title || updates.title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    updates.title = truncate(sanitizeString(updates.title), 200);
  }

  if (updates.description !== undefined) {
    updates.description = sanitizeString(updates.description);
  }

  if (updates.priority !== undefined) {
    if (!['low', 'medium', 'high'].includes(updates.priority)) {
      throw new Error('Invalid priority value');
    }
  }

  if (updates.dueDate !== undefined && updates.dueDate !== null) {
    updates.dueDate = validateDate(updates.dueDate);
  }

  // Merge updates
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Handle status change
  if (updates.status === 'completed' && tasks[index].completedAt === null) {
    tasks[index].completedAt = new Date().toISOString();
  } else if (updates.status === 'active') {
    tasks[index].completedAt = null;
  }

  // Save
  saveTasks(tasks);

  return tasks[index];
}

/**
 * Delete a task
 * @param {string} id - Task ID
 * @returns {boolean} True if deleted
 */
export function deleteTask(id) {
  const tasks = getTasks();

  // Filter out the task
  const filteredTasks = tasks.filter(t => t.id !== id);

  // Check if task was found
  if (filteredTasks.length === tasks.length) {
    throw new Error('Task not found');
  }

  // Save
  saveTasks(filteredTasks);

  return true;
}

/**
 * Toggle task completion status
 * @param {string} id - Task ID
 * @returns {Object} Updated task
 */
export function toggleTaskStatus(id) {
  const task = getTaskById(id);

  if (!task) {
    throw new Error('Task not found');
  }

  const newStatus = task.status === 'active' ? 'completed' : 'active';
  return updateTask(id, { status: newStatus });
}

/**
 * Get count of tasks by status
 * @returns {Object} Counts object
 */
export function getTaskCounts() {
  const tasks = getTasks();

  return {
    total: tasks.length,
    active: tasks.filter(t => t.status === 'active').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };
}

/**
 * Bulk update tasks
 * @param {Array} taskIds - Array of task IDs
 * @param {Object} updates - Updates to apply
 * @returns {number} Number of tasks updated
 */
export function bulkUpdateTasks(taskIds, updates) {
  let count = 0;

  taskIds.forEach(id => {
    try {
      updateTask(id, updates);
      count++;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
    }
  });

  return count;
}

/**
 * Bulk delete tasks
 * @param {Array} taskIds - Array of task IDs
 * @returns {number} Number of tasks deleted
 */
export function bulkDeleteTasks(taskIds) {
  let count = 0;

  taskIds.forEach(id => {
    try {
      deleteTask(id);
      count++;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
    }
  });

  return count;
}
