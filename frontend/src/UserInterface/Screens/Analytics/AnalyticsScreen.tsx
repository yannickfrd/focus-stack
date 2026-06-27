'use client';

import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { useFocusTime } from '@ui/Hooks/Focus/useFocusTime';
import { useTasks } from '@ui/Hooks/Task/useTasks';
import type { FocusTime } from '@/Core/Domain/Entities/FocusTime/FocusTime';

function formatDuration(minutes: number): string {
  if (minutes === 0) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function computeCurrentStreak(focusTimes: FocusTime[]): number {
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

function computeBestStreak(focusTimes: FocusTime[]): number {
  if (focusTimes.length === 0) return 0;
  const dayTimestamps = Array.from(
    new Set(
      focusTimes.map((ft) => {
        const d = new Date(ft.completedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    )
  ).sort((a, b) => a - b);

  let best = 1;
  let current = 1;
  for (let i = 1; i < dayTimestamps.length; i++) {
    const diffDays = (dayTimestamps[i] - dayTimestamps[i - 1]) / 86400000;
    if (diffDays === 1) {
      current++;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }
  return best;
}

function StatHint({ text }: { text: string }) {
  return (
    <span className="group relative ml-1 inline-flex cursor-default">
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[9px] opacity-40 group-hover:opacity-80">?</span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-48 -translate-x-1/2 rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

export function AnalyticsScreen() {
  const { focusTimes } = useFocusTime();
  const { tasks } = useTasks();

  const now = new Date();
  const totalFocusMinutes = focusTimes.reduce((s, ft) => s + ft.duration, 0);
  const avgSessionMinutes = focusTimes.length > 0 ? Math.round(totalFocusMinutes / focusTimes.length) : 0;
  const currentStreak = computeCurrentStreak(focusTimes);
  const bestStreak = computeBestStreak(focusTimes);
  const totalDone = tasks.filter((t) => t.done).length;
  const completionRate = tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0;
  const totalEstimated = tasks
    .filter((t) => t.estimatedTime)
    .reduce((s, t) => s + parseInt(t.estimatedTime ?? '0', 10), 0);

  // 7 derniers jours (glissant)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const minutes = focusTimes
      .filter((ft) => isSameDay(ft.completedAt, d))
      .reduce((s, ft) => s + ft.duration, 0);
    const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    return { label, minutes };
  });
  const last7Max = Math.max(...last7.map((d) => d.minutes), 1);

  // 8 dernières semaines
  const last8Weeks = Array.from({ length: 8 }, (_, i) => {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    weekEnd.setHours(23, 59, 59, 999);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const minutes = focusTimes
      .filter((ft) => ft.completedAt >= weekStart && ft.completedAt <= weekEnd)
      .reduce((s, ft) => s + ft.duration, 0);
    const label = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return { label, minutes };
  }).reverse();
  const last8WeeksMax = Math.max(...last8Weeks.map((w) => w.minutes), 1);

  // Répartition des tâches par priorité
  const priorities = ['haute', 'moyenne', 'basse'] as const;
  const priorityColors = { haute: 'bg-red-400', moyenne: 'bg-yellow-400', basse: 'bg-blue-400' };
  const priorityLabels = { haute: 'Haute', moyenne: 'Moyenne', basse: 'Basse' };
  const priorityStats = priorities.map((p) => {
    const all = tasks.filter((t) => t.priority === p);
    const done = all.filter((t) => t.done).length;
    return { priority: p, total: all.length, done };
  });
  const maxPriorityTotal = Math.max(...priorityStats.map((p) => p.total), 1);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 pt-7 pb-5">
          <h1 className="text-xl font-semibold text-foreground">Analytique</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Vue d'ensemble de ta productivité</p>
        </div>

        <div className="space-y-5 px-8 pb-8">

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">
                Focus total<StatHint text="Temps cumulé de toutes tes sessions de focus depuis le début." />
              </p>
              <p className="mt-1 text-2xl font-bold text-orange-400">{formatDuration(totalFocusMinutes)}</p>
              <p className="mt-1 text-xs text-subtle-foreground">{focusTimes.length} session{focusTimes.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">
                Streak actuel<StatHint text="Jours consécutifs avec au moins une session de focus complétée." />
              </p>
              <p className="mt-1 text-2xl font-bold text-violet-400">{currentStreak} jour{currentStreak !== 1 ? 's' : ''}</p>
              <p className="mt-1 text-xs text-subtle-foreground">Meilleur : {bestStreak} jour{bestStreak !== 1 ? 's' : ''}</p>
            </div>
            <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">
                Complétion globale<StatHint text="Pourcentage de tâches marquées comme terminées sur l'ensemble de tes tâches." />
              </p>
              <p className="mt-1 text-2xl font-bold text-teal-400">{completionRate}%</p>
              <p className="mt-1 text-xs text-subtle-foreground">{totalDone} / {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">
                Moy. par session<StatHint text="Durée moyenne de toutes tes sessions de focus, toutes dates confondues." />
              </p>
              <p className="mt-1 text-2xl font-bold text-yellow-400">{formatDuration(avgSessionMinutes)}</p>
              <p className="mt-1 text-xs text-subtle-foreground">sur {focusTimes.length} session{focusTimes.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">
                Temps estimé<StatHint text="Somme des durées estimées de toutes tes tâches (champ 'temps estimé')." />
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-400">{formatDuration(totalEstimated)}</p>
              <p className="mt-1 text-xs text-subtle-foreground">planifié sur tes tâches</p>
            </div>
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">
                Écart estimé / réel<StatHint text="Différence entre le temps estimé de tes tâches et ton temps de focus réel." />
              </p>
              <p className="mt-1 text-2xl font-bold text-green-400">
                {totalEstimated === 0 && totalFocusMinutes === 0
                  ? '—'
                  : totalFocusMinutes >= totalEstimated
                  ? `+${formatDuration(totalFocusMinutes - totalEstimated)}`
                  : `-${formatDuration(totalEstimated - totalFocusMinutes)}`}
              </p>
              <p className="mt-1 text-xs text-subtle-foreground">
                {totalFocusMinutes >= totalEstimated ? 'au-delà du plan' : 'en-dessous du plan'}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Focus — 7 derniers jours</h2>
              {focusTimes.length === 0 ? (
                <p className="py-8 text-center text-sm text-subtle-foreground">Aucune session enregistrée</p>
              ) : (
                <div className="flex h-36 items-end gap-2">
                  {last7.map(({ label, minutes }, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                      {minutes > 0 && (
                        <span className="text-[9px] text-muted-foreground">{formatDuration(minutes)}</span>
                      )}
                      <div className="flex w-full flex-col justify-end" style={{ height: '112px' }}>
                        <div
                          className="w-full rounded-sm bg-accent/70 transition-all"
                          style={{ height: `${(minutes / last7Max) * 112}px` }}
                        />
                      </div>
                      <span className="text-[9px] text-subtle-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Focus — 8 dernières semaines</h2>
              {focusTimes.length === 0 ? (
                <p className="py-8 text-center text-sm text-subtle-foreground">Aucune session enregistrée</p>
              ) : (
                <div className="flex h-36 items-end gap-1">
                  {last8Weeks.map(({ label, minutes }, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex w-full flex-col justify-end" style={{ height: '112px' }}>
                        <div
                          className="w-full rounded-sm bg-accent/50 transition-all"
                          style={{ height: `${(minutes / last8WeeksMax) * 112}px` }}
                        />
                      </div>
                      <span className="text-[9px] text-subtle-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Répartition par priorité */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Tâches par priorité</h2>
            {tasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-subtle-foreground">Aucune tâche enregistrée</p>
            ) : (
              <div className="space-y-3">
                {priorityStats.map(({ priority, total, done }) => (
                  <div key={priority} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-muted-foreground">{priorityLabels[priority]}</span>
                    <div className="flex flex-1 overflow-hidden rounded-full bg-elevated" style={{ height: '8px' }}>
                      <div
                        className={`${priorityColors[priority]} rounded-full transition-all`}
                        style={{ width: `${(total / maxPriorityTotal) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-xs text-muted-foreground">
                      {done}/{total} faite{total !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
