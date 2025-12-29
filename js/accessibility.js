// Accessibility Module - A11y Features

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announce(message, priority = 'polite') {
  const regionId = priority === 'assertive' ? 'alerts' : 'announcements';
  const region = document.getElementById(regionId);

  if (!region) return;

  // Clear and set new message
  region.textContent = '';
  setTimeout(() => {
    region.textContent = message;
  }, 100);

  // Auto-clear after 5 seconds
  setTimeout(() => {
    region.textContent = '';
  }, 5000);
}

/**
 * Set up keyboard navigation
 */
export function initKeyboardNavigation() {
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardShortcuts(event) {
  // Don't trigger shortcuts when typing in inputs
  if (event.target.matches('input, textarea, select')) {
    // Allow Escape key in inputs
    if (event.key === 'Escape') {
      event.target.blur();
      announce('Input cleared');
    }
    return;
  }

  switch (event.key) {
    case 'n':
    case 'N':
      event.preventDefault();
      focusTaskInput();
      announce('Focus on new task input');
      break;

    case '/':
      event.preventDefault();
      // Could be used for search in future
      break;

    case 'Escape':
      event.preventDefault();
      handleEscape();
      break;

    case 'ArrowUp':
      if (event.target.closest('.task-item')) {
        event.preventDefault();
        navigateTasks('previous');
      }
      break;

    case 'ArrowDown':
      if (event.target.closest('.task-item')) {
        event.preventDefault();
        navigateTasks('next');
      }
      break;

    case ' ':
      if (event.target.closest('.task-item') && event.target.tagName !== 'BUTTON') {
        event.preventDefault();
        toggleFocusedTask();
      }
      break;
  }
}

/**
 * Focus on task title input
 */
function focusTaskInput() {
  const input = document.getElementById('task-title');
  if (input) {
    input.focus();
  }
}

/**
 * Handle Escape key
 */
function handleEscape() {
  // Clear focus from current element
  if (document.activeElement) {
    document.activeElement.blur();
  }

  // Cancel edit mode if active
  const cancelBtn = document.getElementById('cancel-edit');
  if (cancelBtn && !cancelBtn.hidden) {
    cancelBtn.click();
  }
}

/**
 * Navigate between tasks with arrow keys
 * @param {string} direction - 'next' or 'previous'
 */
function navigateTasks(direction) {
  const tasks = Array.from(document.querySelectorAll('.task-item'));
  if (tasks.length === 0) return;

  let currentIndex = tasks.findIndex(task =>
    task.contains(document.activeElement)
  );

  let nextIndex;
  if (direction === 'next') {
    nextIndex = currentIndex < tasks.length - 1 ? currentIndex + 1 : 0;
  } else {
    nextIndex = currentIndex > 0 ? currentIndex - 1 : tasks.length - 1;
  }

  if (tasks[nextIndex]) {
    const checkbox = tasks[nextIndex].querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.focus();
      announce(`Task ${nextIndex + 1} of ${tasks.length}`);
    }
  }
}

/**
 * Toggle the focused task's completion status
 */
function toggleFocusedTask() {
  const focusedTask = document.activeElement.closest('.task-item');
  if (focusedTask) {
    const checkbox = focusedTask.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.click();
    }
  }
}

/**
 * Update ARIA pressed state for filter buttons
 * @param {HTMLElement} button - Button element
 * @param {boolean} isPressed - Pressed state
 */
export function updateAriaPressed(button, isPressed) {
  button.setAttribute('aria-pressed', isPressed);
}

/**
 * Update ARIA live region for statistics
 * @param {Object} stats - Statistics object
 */
export function announceStatsUpdate(stats) {
  const message = `${stats.active} active tasks, ${stats.completed} completed tasks`;
  announce(message, 'polite');
}

/**
 * Update task ARIA label
 * @param {HTMLElement} taskElement - Task element
 * @param {Object} task - Task object
 */
export function updateTaskAriaLabel(taskElement, task) {
  const statusText = task.status === 'completed' ? 'completed' : 'active';
  const dueDateText = task.dueDate
    ? `due ${formatDateForA11y(task.dueDate)}`
    : 'no due date';

  const label = `${task.title}, ${task.priority} priority, ${statusText}, ${dueDateText}`;

  taskElement.setAttribute('aria-label', label);
}

/**
 * Format date for accessibility
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDateForA11y(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return 'invalid date';
  }
}

/**
 * Save focus for later restoration
 */
let lastFocusedElement = null;

export function saveFocus() {
  lastFocusedElement = document.activeElement;
}

/**
 * Restore previously saved focus
 */
export function restoreFocus() {
  if (lastFocusedElement && lastFocusedElement.isConnected) {
    lastFocusedElement.focus();
  }
}

/**
 * Trap focus within an element (for modals)
 * @param {HTMLElement} element - Element to trap focus within
 */
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTab = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTab);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTab);
  };
}

/**
 * Set focus to first error in form
 * @param {HTMLElement} form - Form element
 */
export function focusFirstError(form) {
  const errorElement = form.querySelector('[aria-invalid="true"]');
  if (errorElement) {
    errorElement.focus();
    announce('Please correct the errors in the form', 'assertive');
  }
}

/**
 * Update form field validation state
 * @param {HTMLElement} field - Form field element
 * @param {boolean} isValid - Validation state
 * @param {string} errorMessage - Error message
 */
export function updateFieldValidity(field, isValid, errorMessage = '') {
  field.setAttribute('aria-invalid', !isValid);

  let errorElement = field.parentElement.querySelector('.error-message');

  if (!isValid && errorMessage) {
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'error-message';
      errorElement.id = `${field.id}-error`;
      field.setAttribute('aria-describedby', errorElement.id);
      field.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = errorMessage;
  } else if (errorElement) {
    errorElement.remove();
    field.removeAttribute('aria-describedby');
  }
}
