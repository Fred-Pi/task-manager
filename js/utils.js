// Utility Functions

/**
 * Generate a unique ID for tasks
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sanitize string to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';

  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Format date for display
 * @param {string|null} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return 'No due date';

  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    // Check if today
    if (dueDate.getTime() === today.getTime()) {
      return 'Today';
    }

    // Check if tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dueDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }

    // Check if yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dueDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format date for screen readers
 * @param {string|null} dateString - ISO date string
 * @returns {string} Formatted date for accessibility
 */
export function formatDateForScreenReader(dateString) {
  if (!dateString) return 'no due date';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return 'invalid date';
  }
}

/**
 * Check if a date is overdue
 * @param {string|null} dateString - ISO date string
 * @returns {boolean} True if overdue
 */
export function isOverdue(dateString) {
  if (!dateString) return false;

  try {
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
  } catch (error) {
    return false;
  }
}

/**
 * Validate date string
 * @param {string} dateString - Date string to validate
 * @returns {string|null} Validated date string or null
 */
export function validateDate(dateString) {
  if (!dateString) return null;

  const date = new Date(dateString);

  // Check if valid date
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  return dateString;
}

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength = 200) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength).trim();
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} unsafe - Unsafe string
 * @returns {string} Escaped string
 */
export function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return '';

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
