// localStorage Management Module

const STORAGE_KEY = 'taskManagerData';
const CURRENT_VERSION = '1.0.0';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export function checkStorageAvailability() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
}

/**
 * Initialize storage with default structure
 * @returns {Object} Initial data structure
 */
export function initStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      // First time - create initial structure
      const initialData = {
        version: CURRENT_VERSION,
        tasks: [],
        settings: {
          lastFilter: 'all',
          sortBy: 'dueDate',
          sortOrder: 'asc'
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }

    // Parse existing data
    const parsed = JSON.parse(data);

    // Check version and migrate if needed
    if (parsed.version !== CURRENT_VERSION) {
      return migrateData(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return handleStorageError(error);
  }
}

/**
 * Get all data from storage
 * @returns {Object} All stored data
 */
export function getData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initStorage();
  } catch (error) {
    console.error('Error reading from storage:', error);
    return initStorage();
  }
}

/**
 * Save data to storage
 * @param {Object} data - Data to save
 */
export function saveData(data) {
  try {
    const serialized = JSON.stringify(data);

    // Check size before saving
    if (serialized.length > MAX_STORAGE_SIZE) {
      throw new Error('Storage quota would be exceeded');
    }

    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
      handleQuotaExceeded();
    } else {
      console.error('Error saving data:', error);
      throw error;
    }
  }
}

/**
 * Get all tasks from storage
 * @returns {Array} Array of tasks
 */
export function getTasks() {
  const data = getData();
  return data.tasks || [];
}

/**
 * Save tasks to storage
 * @param {Array} tasks - Array of tasks to save
 */
export function saveTasks(tasks) {
  const data = getData();
  data.tasks = tasks;
  data.lastUpdated = new Date().toISOString();
  saveData(data);
}

/**
 * Get settings from storage
 * @returns {Object} Settings object
 */
export function getSettings() {
  const data = getData();
  return data.settings || {
    lastFilter: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  };
}

/**
 * Save settings to storage
 * @param {Object} settings - Settings to save
 */
export function saveSettings(settings) {
  const data = getData();
  data.settings = { ...data.settings, ...settings };
  saveData(data);
}

/**
 * Estimate storage usage
 * @returns {number} Bytes used
 */
export function estimateStorageUsage() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * Handle storage quota exceeded
 */
function handleQuotaExceeded() {
  console.warn('Storage quota exceeded');

  const tasks = getTasks();

  // Strategy 1: Remove completed tasks older than 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filtered = tasks.filter(task => {
    if (task.status === 'completed' && task.completedAt) {
      return new Date(task.completedAt) > thirtyDaysAgo;
    }
    return true;
  });

  if (filtered.length < tasks.length) {
    saveTasks(filtered);
    alert(`Removed ${tasks.length - filtered.length} old completed tasks to free up space.`);
    return;
  }

  // Strategy 2: Offer export and clear
  const shouldExport = confirm(
    'Storage is full. Would you like to export your tasks before clearing old data?'
  );

  if (shouldExport) {
    exportTasks(tasks);
  }

  // Keep only active tasks
  const activeTasks = tasks.filter(task => task.status === 'active');
  saveTasks(activeTasks);
  alert(`Cleared ${tasks.length - activeTasks.length} completed tasks to free up space.`);
}

/**
 * Export tasks to JSON file
 * @param {Array} tasks - Tasks to export
 */
export function exportTasks(tasks) {
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Handle storage errors
 * @param {Error} error - Error object
 * @returns {Object} Initial data structure
 */
function handleStorageError(error) {
  console.error('Storage error:', error);

  const shouldReset = confirm(
    'There was an error loading your data. Would you like to reset the application? (Your data will be lost)'
  );

  if (shouldReset) {
    localStorage.removeItem(STORAGE_KEY);
    return initStorage();
  }

  throw error;
}

/**
 * Migrate data from old version to new version
 * @param {Object} oldData - Old data structure
 * @returns {Object} Migrated data
 */
function migrateData(oldData) {
  console.log('Migrating data from version', oldData.version, 'to', CURRENT_VERSION);

  // For future versions, add migration logic here
  const migrated = {
    ...oldData,
    version: CURRENT_VERSION
  };

  saveData(migrated);
  return migrated;
}

/**
 * Clear all data from storage
 */
export function clearAllData() {
  const confirmed = confirm('Are you sure you want to delete all tasks? This cannot be undone.');

  if (confirmed) {
    localStorage.removeItem(STORAGE_KEY);
    initStorage();
    return true;
  }

  return false;
}
