// Browser Notifications Module

/**
 * Request notification permission from user
 * @returns {Promise<boolean>} True if permission granted
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show a notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export function showNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
}

/**
 * Check for tasks due soon and notify
 * @param {Array} tasks - Array of tasks
 */
export function checkDueSoonTasks(tasks) {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  tasks.forEach(task => {
    if (task.status === 'active' && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const taskKey = `notified_${task.id}_${task.dueDate}`;

      // Check if we've already notified about this task today
      const lastNotified = localStorage.getItem(taskKey);
      if (lastNotified) {
        const lastNotifiedDate = new Date(lastNotified);
        if (lastNotifiedDate.toDateString() === now.toDateString()) {
          return; // Already notified today
        }
      }

      // Due today but not yet notified
      if (dueDate <= today && dueDate >= now) {
        const hoursUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60));

        if (hoursUntilDue <= 1 && dueDate > now) {
          showNotification('Task Due Soon!', {
            body: `"${task.title}" is due in ${hoursUntilDue} hour(s)`,
            tag: task.id,
            requireInteraction: true
          });
          localStorage.setItem(taskKey, now.toISOString());
        } else if (dueDate.toDateString() === now.toDateString()) {
          // Due today
          showNotification('Task Due Today', {
            body: `"${task.title}" is due today`,
            tag: task.id
          });
          localStorage.setItem(taskKey, now.toISOString());
        }
      }

      // Overdue tasks
      if (dueDate < now) {
        const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        if (!lastNotified || daysOverdue === 1) {
          showNotification('Overdue Task', {
            body: `"${task.title}" is ${daysOverdue} day(s) overdue`,
            tag: task.id,
            requireInteraction: true
          });
          localStorage.setItem(taskKey, now.toISOString());
        }
      }
    }
  });
}

/**
 * Initialize notification checking with interval
 * @param {Function} getTasksFn - Function to get current tasks
 * @returns {number} Interval ID
 */
export function initNotificationChecking(getTasksFn) {
  // Check immediately
  requestNotificationPermission().then(granted => {
    if (granted) {
      checkDueSoonTasks(getTasksFn());
    }
  });

  // Check every 30 minutes
  const intervalId = setInterval(() => {
    if (Notification.permission === 'granted') {
      checkDueSoonTasks(getTasksFn());
    }
  }, 30 * 60 * 1000);

  return intervalId;
}

/**
 * Add notification settings toggle to UI
 */
export function setupNotificationToggle() {
  const toggleBtn = document.getElementById('notification-toggle');

  if (toggleBtn) {
    // Set initial state
    toggleBtn.checked = Notification.permission === 'granted';

    toggleBtn.addEventListener('change', async (e) => {
      if (e.target.checked) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          e.target.checked = false;
          alert('Notification permission denied. Please enable it in your browser settings.');
        }
      }
    });
  }
}
