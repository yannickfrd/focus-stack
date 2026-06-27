'use client';

import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { StatHint } from '@ui/Components/Stats/StatHint';
import { useStats } from '@ui/Hooks/Stats/useStats';
import { formatDuration } from '@ui/Hooks/Stats/statsUtils';

const priorityColors = { haute: 'bg-red-400', moyenne: 'bg-yellow-400', basse: 'bg-blue-400' };
const priorityLabels = { haute: 'Haute', moyenne: 'Moyenne', basse: 'Basse' };

export function AnalyticsScreen() {
  const {
    focusTimes,
    tasks,
    totalFocusMinutes,
    avgSessionMinutes,
    currentStreak,
    bestStreak,
    totalDone,
    globalCompletionRate,
    totalEstimatedMinutes,
    last7,
    last8Weeks,
    priorityStats,
  } = useStats();

  const last7Max = Math.max(...last7.map((d) => d.minutes), 1);
  const last8WeeksMax = Math.max(...last8Weeks.map((w) => w.minutes), 1);
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
              <p className="mt-1 text-2xl font-bold text-teal-400">{globalCompletionRate}%</p>
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
              <p className="mt-1 text-2xl font-bold text-blue-400">{formatDuration(totalEstimatedMinutes)}</p>
              <p className="mt-1 text-xs text-subtle-foreground">planifié sur tes tâches</p>
            </div>
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">
                Écart estimé / réel<StatHint text="Différence entre le temps estimé de tes tâches et ton temps de focus réel." />
              </p>
              <p className="mt-1 text-2xl font-bold text-green-400">
                {totalEstimatedMinutes === 0 && totalFocusMinutes === 0
                  ? '—'
                  : totalFocusMinutes >= totalEstimatedMinutes
                  ? `+${formatDuration(totalFocusMinutes - totalEstimatedMinutes)}`
                  : `-${formatDuration(totalEstimatedMinutes - totalFocusMinutes)}`}
              </p>
              <p className="mt-1 text-xs text-subtle-foreground">
                {totalFocusMinutes >= totalEstimatedMinutes ? 'au-delà du plan' : 'en-dessous du plan'}
              </p>
            </div>
          </div>

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
