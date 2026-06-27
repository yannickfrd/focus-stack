import type { FocusTime } from '@/Core/Domain/Entities/FocusTime/FocusTime';

export function formatDuration(minutes: number): string {
  if (minutes === 0) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function computeCurrentStreak(focusTimes: FocusTime[]): number {
  if (focusTimes.length === 0) return 0;
  const keys = new Set(focusTimes.map((ft) => dayKey(ft.completedAt)));
  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);
  while (keys.has(dayKey(check))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

export function computeStreakHistory(focusTimes: FocusTime[]): { start: Date; end: Date; days: number }[] {
  if (focusTimes.length === 0) return [];

  const timestamps = Array.from(
    new Set(
      focusTimes.map((ft) => {
        const d = new Date(ft.completedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    )
  ).sort((a, b) => a - b);

  const streaks: { start: Date; end: Date; days: number }[] = [];
  let start = timestamps[0];
  let prev = timestamps[0];

  for (let i = 1; i < timestamps.length; i++) {
    if ((timestamps[i] - prev) / 86400000 === 1) {
      prev = timestamps[i];
    } else {
      streaks.push({ start: new Date(start), end: new Date(prev), days: Math.round((prev - start) / 86400000) + 1 });
      start = timestamps[i];
      prev = timestamps[i];
    }
  }
  streaks.push({ start: new Date(start), end: new Date(prev), days: Math.round((prev - start) / 86400000) + 1 });
  return streaks.sort((a, b) => b.days - a.days);
}
