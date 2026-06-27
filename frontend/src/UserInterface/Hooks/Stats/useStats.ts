import { useFocusTime } from '@ui/Hooks/Focus/useFocusTime';
import { useTasks } from '@ui/Hooks/Task/useTasks';
import { useRoutines } from '@ui/Hooks/Routine/useRoutines';
import {
  isSameDay,
  dayKey,
  getWeekStart,
  computeCurrentStreak,
  computeStreakHistory,
} from './statsUtils';

export function useStats() {
  const { focusTimes } = useFocusTime();
  const { tasks } = useTasks();
  const { routines } = useRoutines();

  const now = new Date();
  const weekStart = getWeekStart(now);

  // Focus
  const totalFocusMinutes = focusTimes.reduce((s, ft) => s + ft.duration, 0);
  const todayFocusTimes = focusTimes.filter((ft) => isSameDay(ft.completedAt, now));
  const todayMinutes = todayFocusTimes.reduce((s, ft) => s + ft.duration, 0);
  const todaySessionCount = todayFocusTimes.length;
  const weekSessions = focusTimes.filter((ft) => ft.completedAt >= weekStart);
  const weekMinutes = weekSessions.reduce((s, ft) => s + ft.duration, 0);
  const weekSessionCount = weekSessions.length;
  const avgSessionMinutes = focusTimes.length > 0 ? Math.round(totalFocusMinutes / focusTimes.length) : 0;
  const currentStreak = computeCurrentStreak(focusTimes);
  const streakHistory = computeStreakHistory(focusTimes);
  const bestStreak = streakHistory[0]?.days ?? 0;
  const activeDays = new Set(focusTimes.map((ft) => dayKey(ft.completedAt))).size;

  const minutesByDay = new Map<string, number>();
  for (const ft of focusTimes) {
    const k = dayKey(ft.completedAt);
    minutesByDay.set(k, (minutesByDay.get(k) ?? 0) + ft.duration);
  }

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const minutes = focusTimes.filter((ft) => isSameDay(ft.completedAt, d)).reduce((s, ft) => s + ft.duration, 0);
    return { label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), minutes };
  });

  const last8Weeks = Array.from({ length: 8 }, (_, i) => {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    weekEnd.setHours(23, 59, 59, 999);
    const wStart = new Date(weekEnd);
    wStart.setDate(wStart.getDate() - 6);
    wStart.setHours(0, 0, 0, 0);
    const minutes = focusTimes
      .filter((ft) => ft.completedAt >= wStart && ft.completedAt <= weekEnd)
      .reduce((s, ft) => s + ft.duration, 0);
    return { label: wStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), minutes };
  }).reverse();

  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return focusTimes.filter((ft) => isSameDay(ft.completedAt, d)).reduce((s, ft) => s + ft.duration, 0);
  });

  // Tasks
  const todayTasks = tasks.filter((t) => !t.scheduledFor || t.scheduledFor === 'today');
  const todayDone = todayTasks.filter((t) => t.done).length;
  const todayTotal = todayTasks.length;
  const pending = todayTasks.filter((t) => !t.done).length;
  const totalDone = tasks.filter((t) => t.done).length;
  const globalCompletionRate = tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0;
  const totalEstimatedMinutes = tasks
    .filter((t) => t.estimatedTime)
    .reduce((s, t) => s + parseInt(t.estimatedTime ?? '0', 10), 0);
  const priorityStats = (['haute', 'moyenne', 'basse'] as const).map((p) => {
    const all = tasks.filter((t) => t.priority === p);
    return { priority: p, total: all.length, done: all.filter((t) => t.done).length };
  });

  return {
    focusTimes,
    tasks,
    routines,
    // focus
    totalFocusMinutes,
    todayMinutes,
    todaySessionCount,
    weekMinutes,
    weekSessionCount,
    avgSessionMinutes,
    currentStreak,
    bestStreak,
    activeDays,
    streakHistory,
    minutesByDay,
    last7,
    last8Weeks,
    weekBars,
    // tasks
    todayTasks,
    todayDone,
    todayTotal,
    pending,
    totalDone,
    globalCompletionRate,
    totalEstimatedMinutes,
    priorityStats,
  };
}
