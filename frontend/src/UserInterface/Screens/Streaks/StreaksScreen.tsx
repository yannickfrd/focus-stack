'use client';

import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { useStats } from '@ui/Hooks/Stats/useStats';
import { dayKey, formatDate } from '@ui/Hooks/Stats/statsUtils';
import type { FocusTime } from '@/Core/Domain/Entities/FocusTime/FocusTime';

const BADGES = [
  { id: 'first_session', label: 'Première session',  desc: 'Complète ta première session de focus',       check: (ft: FocusTime[], _d: number, _b: number) => ft.length >= 1 },
  { id: 'sessions_10',   label: '10 sessions',        desc: 'Complète 10 sessions de focus',               check: (ft: FocusTime[]) => ft.length >= 10 },
  { id: 'sessions_50',   label: '50 sessions',        desc: 'Complète 50 sessions de focus',               check: (ft: FocusTime[]) => ft.length >= 50 },
  { id: 'sessions_100',  label: '100 sessions',       desc: 'Complète 100 sessions de focus',              check: (ft: FocusTime[]) => ft.length >= 100 },
  { id: 'focus_1h',      label: '1h de focus',        desc: 'Accumule 1h de focus au total',               check: (ft: FocusTime[]) => ft.reduce((s, f) => s + f.duration, 0) >= 60 },
  { id: 'focus_10h',     label: '10h de focus',       desc: 'Accumule 10h de focus au total',              check: (ft: FocusTime[]) => ft.reduce((s, f) => s + f.duration, 0) >= 600 },
  { id: 'focus_50h',     label: '50h de focus',       desc: 'Accumule 50h de focus au total',              check: (ft: FocusTime[]) => ft.reduce((s, f) => s + f.duration, 0) >= 3000 },
  { id: 'streak_3',      label: 'Série de 3 jours',   desc: 'Maintiens un streak de 3 jours consécutifs',  check: (_ft: FocusTime[], _d: number, best: number) => best >= 3 },
  { id: 'streak_7',      label: 'Série de 7 jours',   desc: 'Maintiens un streak de 7 jours consécutifs',  check: (_ft: FocusTime[], _d: number, best: number) => best >= 7 },
  { id: 'streak_30',     label: 'Série de 30 jours',  desc: 'Maintiens un streak de 30 jours consécutifs', check: (_ft: FocusTime[], _d: number, best: number) => best >= 30 },
  { id: 'tasks_10',      label: '10 tâches faites',   desc: 'Termine 10 tâches',                           check: (_ft: FocusTime[], done: number) => done >= 10 },
  { id: 'tasks_50',      label: '50 tâches faites',   desc: 'Termine 50 tâches',                           check: (_ft: FocusTime[], done: number) => done >= 50 },
] as const;

function heatColor(minutes: number, max: number): string {
  if (minutes === 0) return 'bg-elevated';
  const ratio = minutes / max;
  if (ratio < 0.25) return 'bg-accent/20';
  if (ratio < 0.5)  return 'bg-accent/45';
  if (ratio < 0.75) return 'bg-accent/70';
  return 'bg-accent';
}

export function StreaksScreen() {
  const { focusTimes, totalDone, currentStreak, bestStreak, activeDays, streakHistory, minutesByDay } = useStats();

  const unlockedBadges = BADGES.filter((b) => b.check(focusTimes, totalDone, bestStreak));
  const lockedBadges   = BADGES.filter((b) => !b.check(focusTimes, totalDone, bestStreak));

  // Heatmap — 53 semaines glissantes
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const gridEnd = new Date(today);
  gridEnd.setDate(gridEnd.getDate() + (6 - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)));

  const totalCells = 53 * 7;
  const gridStart = new Date(gridEnd);
  gridStart.setDate(gridStart.getDate() - totalCells + 1);

  const cells: { date: Date; minutes: number }[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    cells.push({ date: d, minutes: minutesByDay.get(dayKey(d)) ?? 0 });
  }

  const maxMinutes = Math.max(...cells.map((c) => c.minutes), 1);

  const weeks: { date: Date; minutes: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const m = week[0].date.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ col, label: week[0].date.toLocaleDateString('fr-FR', { month: 'short' }) });
      lastMonth = m;
    }
  });

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 pt-7 pb-5">
          <h1 className="text-xl font-semibold text-foreground">Séries</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Tes habitudes de focus au fil du temps</p>
        </div>

        <div className="space-y-5 px-8 pb-8">

          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Streak actuel</p>
              <p className="mt-1 text-2xl font-bold text-violet-400">{currentStreak} jour{currentStreak !== 1 ? 's' : ''}</p>
              <p className="mt-1 text-xs text-subtle-foreground">
                {currentStreak === 0 ? "Aucune session aujourd'hui" : 'En cours'}
              </p>
            </div>
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Meilleur streak</p>
              <p className="mt-1 text-2xl font-bold text-orange-400">{bestStreak} jour{bestStreak !== 1 ? 's' : ''}</p>
              <p className="mt-1 text-xs text-subtle-foreground">record personnel</p>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Jours actifs</p>
              <p className="mt-1 text-2xl font-bold text-blue-400">{activeDays}</p>
              <p className="mt-1 text-xs text-subtle-foreground">jours avec au moins 1 session</p>
            </div>
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Badges débloqués</p>
              <p className="mt-1 text-2xl font-bold text-green-400">{unlockedBadges.length} / {BADGES.length}</p>
              <p className="mt-1 text-xs text-subtle-foreground">{lockedBadges.length} restant{lockedBadges.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Activité — 12 derniers mois</h2>
            <div className="overflow-x-auto">
              <div className="inline-flex flex-col gap-1">
                <div className="flex gap-1">
                  {weeks.map((_, col) => {
                    const label = monthLabels.find((m) => m.col === col);
                    return (
                      <div key={col} className="w-3 text-[9px] text-subtle-foreground">
                        {label ? label.label : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-1">
                  {weeks.map((week, col) => (
                    <div key={col} className="flex flex-col gap-1">
                      {week.map(({ date, minutes }, row) => (
                        <div
                          key={row}
                          title={`${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}${minutes > 0 ? ` — ${minutes}min` : ''}`}
                          className={`h-3 w-3 rounded-sm ${heatColor(minutes, maxMinutes)} ${date > today ? 'opacity-0' : ''}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[9px] text-subtle-foreground">Moins</span>
                  {['bg-elevated', 'bg-accent/20', 'bg-accent/45', 'bg-accent/70', 'bg-accent'].map((c) => (
                    <div key={c} className={`h-3 w-3 rounded-sm ${c}`} />
                  ))}
                  <span className="text-[9px] text-subtle-foreground">Plus</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Badges</h2>
              <div className="space-y-2">
                {BADGES.map((badge) => {
                  const unlocked = unlockedBadges.some((b) => b.id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-center gap-3 rounded-lg p-2.5 ${unlocked ? 'bg-accent/10' : 'bg-elevated opacity-50'}`}
                    >
                      <span className="text-lg">{unlocked ? '🏅' : '🔒'}</span>
                      <div>
                        <p className={`text-xs font-medium ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {badge.label}
                        </p>
                        <p className="text-[11px] text-subtle-foreground">{badge.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Historique des séries</h2>
              {streakHistory.length === 0 ? (
                <p className="py-8 text-center text-sm text-subtle-foreground">Aucune série enregistrée</p>
              ) : (
                <div className="space-y-2">
                  {streakHistory.slice(0, 10).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-elevated px-3 py-2">
                      <span className="w-5 text-center text-xs font-bold text-muted-foreground">#{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-xs text-foreground">{s.days} jour{s.days !== 1 ? 's' : ''}</p>
                        <p className="text-[11px] text-subtle-foreground">
                          {formatDate(s.start)} → {formatDate(s.end)}
                        </p>
                      </div>
                      {i === 0 && <span className="text-xs text-yellow-400">★ record</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
