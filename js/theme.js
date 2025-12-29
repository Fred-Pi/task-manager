// Theme Management Module

const THEME_KEY = 'taskManagerTheme';

/**
 * Get saved theme preference
 * @returns {string} 'light' or 'dark'
 */
export function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);

  if (saved) {
    return saved;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Apply theme to document
 * @param {string} theme - 'light' or 'dark'
 */
export function applyTheme(theme) {
  const html = document.documentElement;

  if (theme === 'dark') {
    html.classList.add('dark-mode');
    html.classList.remove('light-mode');
  } else {
    html.classList.add('light-mode');
    html.classList.remove('dark-mode');
  }

  // Save preference
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Toggle between light and dark theme
 * @returns {string} New theme
 */
export function toggleTheme() {
  const currentTheme = getSavedTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on page load
 */
export function initTheme() {
  const theme = getSavedTheme();
  applyTheme(theme);

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const saved = localStorage.getItem(THEME_KEY);
      if (!saved) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

/**
 * Setup theme toggle button
 */
export function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const newTheme = toggleTheme();
      const message = `Switched to ${newTheme} mode`;

      // Update ARIA label
      toggleBtn.setAttribute('aria-label', `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} mode`);

      // Announce to screen readers
      const announcement = document.getElementById('announcements');
      if (announcement) {
        announcement.textContent = message;
        setTimeout(() => {
          announcement.textContent = '';
        }, 2000);
      }
    });
  }
}
