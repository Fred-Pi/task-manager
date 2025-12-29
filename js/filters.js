// Filtering and Sorting Module

/**
 * Filter tasks based on criteria
 * @param {Array} tasks - Array of tasks
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered tasks
 */
export function filterTasks(tasks, filters = {}) {
  let filtered = [...tasks];

  // Filter by status
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(task => task.status === filters.status);
  }

  // Filter by priority
  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter(task => task.priority === filters.priority);
  }

  // Filter by search query
  if (filters.search && filters.search.trim().length > 0) {
    const query = filters.search.toLowerCase().trim();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  }

  // Filter by date range
  if (filters.dateFrom) {
    filtered = filtered.filter(task =>
      task.dueDate && new Date(task.dueDate) >= new Date(filters.dateFrom)
    );
  }

  if (filters.dateTo) {
    filtered = filtered.filter(task =>
      task.dueDate && new Date(task.dueDate) <= new Date(filters.dateTo)
    );
  }

  // Filter overdue tasks only
  if (filters.showOverdueOnly) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter(task =>
      task.status === 'active' &&
      task.dueDate &&
      new Date(task.dueDate) < today
    );
  }

  return filtered;
}

/**
 * Sort tasks based on criteria
 * @param {Array} tasks - Array of tasks
 * @param {string} sortBy - Sort field (dueDate, priority, createdAt, title)
 * @param {string} sortOrder - Sort order (asc, desc)
 * @returns {Array} Sorted tasks
 */
export function sortTasks(tasks, sortBy = 'dueDate', sortOrder = 'asc') {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'dueDate':
        // Tasks without due dates go to the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        comparison = new Date(a.dueDate) - new Date(b.dueDate);
        break;

      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;

      case 'createdAt':
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;

      case 'updatedAt':
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
        break;

      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;

      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Filter and sort tasks
 * @param {Array} tasks - Array of tasks
 * @param {Object} filters - Filter options
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort order
 * @returns {Array} Filtered and sorted tasks
 */
export function filterAndSortTasks(tasks, filters = {}, sortBy = 'dueDate', sortOrder = 'asc') {
  const filtered = filterTasks(tasks, filters);
  return sortTasks(filtered, sortBy, sortOrder);
}

/**
 * Group tasks by a specific field
 * @param {Array} tasks - Array of tasks
 * @param {string} groupBy - Field to group by (priority, status, dueDate)
 * @returns {Object} Grouped tasks
 */
export function groupTasks(tasks, groupBy = 'priority') {
  const grouped = {};

  tasks.forEach(task => {
    let key;

    switch (groupBy) {
      case 'priority':
        key = task.priority;
        break;

      case 'status':
        key = task.status;
        break;

      case 'dueDate':
        if (!task.dueDate) {
          key = 'No due date';
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate < today) {
            key = 'Overdue';
          } else if (dueDate.getTime() === today.getTime()) {
            key = 'Today';
          } else if (dueDate.getTime() === today.getTime() + 86400000) {
            key = 'Tomorrow';
          } else if (dueDate.getTime() <= today.getTime() + 7 * 86400000) {
            key = 'This week';
          } else {
            key = 'Later';
          }
        }
        break;

      default:
        key = 'Unknown';
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(task);
  });

  return grouped;
}

/**
 * Get tasks that match a specific criteria
 * @param {Array} tasks - Array of tasks
 * @param {Function} predicate - Filter function
 * @returns {Array} Matching tasks
 */
export function findTasks(tasks, predicate) {
  return tasks.filter(predicate);
}

/**
 * Get overdue tasks
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Overdue active tasks
 */
export function getOverdueTasks(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter(task =>
    task.status === 'active' &&
    task.dueDate &&
    new Date(task.dueDate) < today
  );
}

/**
 * Get tasks due today
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Tasks due today
 */
export function getTasksDueToday(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter(task =>
    task.status === 'active' &&
    task.dueDate &&
    new Date(task.dueDate).setHours(0, 0, 0, 0) === today.getTime()
  );
}

/**
 * Get tasks due this week
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Tasks due this week
 */
export function getTasksDueThisWeek(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  return tasks.filter(task =>
    task.status === 'active' &&
    task.dueDate &&
    new Date(task.dueDate) >= today &&
    new Date(task.dueDate) <= weekFromNow
  );
}
