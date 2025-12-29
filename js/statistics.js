// Statistics Calculation Module

/**
 * Calculate comprehensive statistics for tasks
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Statistics object
 */
export function calculateStatistics(tasks) {
  const stats = {
    total: tasks.length,
    active: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0,
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    },
    byStatus: {
      active: 0,
      completed: 0
    },
    dueToday: 0,
    dueThisWeek: 0,
    dueSoon: 0,
    noDueDate: 0
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  tasks.forEach(task => {
    // Count by status
    if (task.status === 'active') {
      stats.active++;
      stats.byStatus.active++;
    } else if (task.status === 'completed') {
      stats.completed++;
      stats.byStatus.completed++;
    }

    // Count by priority
    if (task.priority in stats.byPriority) {
      stats.byPriority[task.priority]++;
    }

    // Check due date status for active tasks
    if (task.status === 'active') {
      if (!task.dueDate) {
        stats.noDueDate++;
      } else {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        // Check if overdue
        if (dueDate < today) {
          stats.overdue++;
        }

        // Due today
        if (dueDate.getTime() === today.getTime()) {
          stats.dueToday++;
          stats.dueSoon++;
        }

        // Due this week
        if (dueDate >= today && dueDate <= weekFromNow) {
          stats.dueThisWeek++;

          // Due soon (within 3 days)
          if (dueDate <= threeDaysFromNow) {
            stats.dueSoon++;
          }
        }
      }
    }
  });

  // Calculate completion rate
  if (stats.total > 0) {
    stats.completionRate = Math.round((stats.completed / stats.total) * 100);
  }

  return stats;
}

/**
 * Get priority distribution
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Priority distribution
 */
export function getPriorityDistribution(tasks) {
  const distribution = {
    high: 0,
    medium: 0,
    low: 0
  };

  tasks.forEach(task => {
    if (task.priority in distribution) {
      distribution[task.priority]++;
    }
  });

  return distribution;
}

/**
 * Get status distribution
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Status distribution
 */
export function getStatusDistribution(tasks) {
  const distribution = {
    active: 0,
    completed: 0
  };

  tasks.forEach(task => {
    if (task.status in distribution) {
      distribution[task.status]++;
    }
  });

  return distribution;
}

/**
 * Calculate productivity metrics
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Productivity metrics
 */
export function getProductivityMetrics(tasks) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const metrics = {
    completedToday: 0,
    completedThisWeek: 0,
    completedThisMonth: 0,
    createdToday: 0,
    createdThisWeek: 0,
    averageCompletionTime: 0
  };

  let totalCompletionTime = 0;
  let completedWithDates = 0;

  tasks.forEach(task => {
    const createdAt = new Date(task.createdAt);

    // Count created tasks
    if (createdAt >= oneDayAgo) {
      metrics.createdToday++;
    }
    if (createdAt >= oneWeekAgo) {
      metrics.createdThisWeek++;
    }

    // Count completed tasks
    if (task.status === 'completed' && task.completedAt) {
      const completedAt = new Date(task.completedAt);

      if (completedAt >= oneDayAgo) {
        metrics.completedToday++;
      }
      if (completedAt >= oneWeekAgo) {
        metrics.completedThisWeek++;
      }
      if (completedAt >= oneMonthAgo) {
        metrics.completedThisMonth++;
      }

      // Calculate completion time
      const completionTime = completedAt - createdAt;
      totalCompletionTime += completionTime;
      completedWithDates++;
    }
  });

  // Calculate average completion time in hours
  if (completedWithDates > 0) {
    metrics.averageCompletionTime = Math.round(
      totalCompletionTime / completedWithDates / (1000 * 60 * 60)
    );
  }

  return metrics;
}

/**
 * Get overdue statistics
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Overdue statistics
 */
export function getOverdueStats(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    total: 0,
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    },
    overdueByDays: {
      lessThanWeek: 0,
      oneToTwoWeeks: 0,
      moreThanTwoWeeks: 0
    }
  };

  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

  tasks.forEach(task => {
    if (task.status === 'active' && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        stats.total++;
        stats.byPriority[task.priority]++;

        if (dueDate >= oneWeekAgo) {
          stats.overdueByDays.lessThanWeek++;
        } else if (dueDate >= twoWeeksAgo) {
          stats.overdueByDays.oneToTwoWeeks++;
        } else {
          stats.overdueByDays.moreThanTwoWeeks++;
        }
      }
    }
  });

  return stats;
}

/**
 * Get upcoming tasks summary
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Upcoming tasks summary
 */
export function getUpcomingSummary(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const summary = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: []
  };

  tasks.forEach(task => {
    if (task.status === 'active' && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate.getTime() === today.getTime()) {
        summary.today.push(task);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        summary.tomorrow.push(task);
      } else if (dueDate > today && dueDate <= nextWeek) {
        summary.thisWeek.push(task);
      } else if (dueDate > nextWeek) {
        summary.later.push(task);
      }
    }
  });

  return summary;
}
