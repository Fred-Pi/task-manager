# Task Manager

A modern, accessible personal task management web application built with vanilla JavaScript, modern CSS, and localStorage for data persistence.

## Features

- **Task Management**: Create, edit, delete, and toggle task completion
- **Priority Levels**: Assign high, medium, or low priority to tasks
- **Due Dates**: Set and track due dates for tasks
- **Filtering**: Filter tasks by status (all, active, completed) and priority
- **Sorting**: Sort tasks by due date, priority, or creation date
- **Statistics Dashboard**: View comprehensive statistics including:
  - Total tasks
  - Active and completed counts
  - Completion rate
  - Overdue tasks
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Data Persistence**: All data stored locally in the browser using localStorage

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start managing your tasks!

Alternatively, you can serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## Usage

### Creating a Task

1. Enter a task title in the "Task Title" field (required)
2. Select a priority level (low, medium, or high)
3. Optionally set a due date
4. Click "Add Task"

### Editing a Task

1. Click the edit icon (pencil) on any task
2. Modify the task details in the form
3. Click "Update Task" to save changes
4. Click "Cancel" to discard changes

### Completing a Task

- Click the checkbox next to a task to mark it as complete
- Click again to mark it as active

### Deleting a Task

1. Click the delete icon (trash) on any task
2. Confirm the deletion in the dialog

### Filtering Tasks

- Use the status filter buttons to show all, active, or completed tasks
- Select a priority from the priority dropdown to filter by priority level
- Filters are remembered when you return to the app

### Sorting Tasks

Use the "Sort By" dropdown to sort tasks by:
- **Due Date**: Tasks without due dates appear last
- **Priority**: High priority tasks appear first
- **Created Date**: Newest or oldest first

## Keyboard Shortcuts

- **N**: Focus on new task input
- **Escape**: Cancel current action or clear focus
- **Arrow Up/Down**: Navigate between tasks (when focused on a task)
- **Space**: Toggle task completion (when focused on a task)
- **Tab**: Navigate between interactive elements

## Project Structure

```
main/
├── index.html              # Main HTML file
├── css/
│   ├── reset.css          # CSS normalization
│   ├── variables.css      # Design system (colors, spacing, etc.)
│   ├── layout.css         # Responsive grid layout
│   └── components.css     # Component-specific styles
├── js/
│   ├── app.js            # Application entry point
│   ├── storage.js        # localStorage management
│   ├── taskManager.js    # Task CRUD operations
│   ├── ui.js             # DOM rendering
│   ├── filters.js        # Filtering and sorting logic
│   ├── statistics.js     # Statistics calculations
│   ├── accessibility.js  # Accessibility features
│   └── utils.js          # Utility functions
└── README.md             # This file
```

## Architecture

### Separation of Concerns

The application follows a modular architecture with clear separation of concerns:

- **Storage Layer** (`storage.js`): Handles all localStorage operations
- **Business Logic** (`taskManager.js`): Manages task CRUD operations
- **View Layer** (`ui.js`): Handles DOM manipulation and rendering
- **Utilities** (`utils.js`, `filters.js`, `statistics.js`): Reusable helper functions
- **Accessibility** (`accessibility.js`): ARIA labels, keyboard navigation, screen reader support
- **Bootstrap** (`app.js`): Initializes the app and wires everything together

### Data Model

Each task has the following structure:

```javascript
{
  id: string,              // Unique identifier
  title: string,           // Task title (max 200 chars)
  description: string,     // Optional description
  priority: string,        // 'low' | 'medium' | 'high'
  status: string,          // 'active' | 'completed'
  dueDate: string | null,  // ISO 8601 date (YYYY-MM-DD)
  createdAt: string,       // ISO 8601 timestamp
  updatedAt: string,       // ISO 8601 timestamp
  completedAt: string | null // ISO 8601 timestamp
}
```

## Accessibility Features

- **Semantic HTML**: Proper use of HTML5 semantic elements
- **ARIA Labels**: Comprehensive ARIA labels and roles
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Live regions for dynamic updates
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliant color ratios
- **Reduced Motion**: Respects `prefers-reduced-motion` preference

## Browser Compatibility

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

## Data Storage

All task data is stored locally in your browser using localStorage:

- **Maximum Size**: ~5MB (browser dependent)
- **Persistence**: Data persists across browser sessions
- **Privacy**: Data never leaves your device
- **Quota Management**: Automatic cleanup of old completed tasks when storage is full

### Exporting Data

The app automatically offers to export your tasks as JSON before clearing data when storage is full. The exported file can be used for backup purposes.

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px+

## Development

### Code Style

- ES6+ JavaScript with modules
- Mobile-first CSS
- BEM-inspired class naming
- CSS custom properties for theming

### Making Changes

1. Edit the relevant module file
2. Refresh your browser to see changes
3. No build step required

## Future Enhancements

Potential features for future versions:

- Drag and drop task reordering
- Task categories/tags
- Subtasks
- Recurring tasks
- Dark mode toggle
- Data export/import
- Cloud synchronization
- Notifications for due dates
- Calendar view

## License

This project is open source and available for personal and educational use.

## Credits

Built with vanilla JavaScript, modern CSS, and localStorage.

## Support

For issues or questions, please open an issue in the repository.
