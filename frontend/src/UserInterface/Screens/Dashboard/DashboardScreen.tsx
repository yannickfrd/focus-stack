'use client';

import { useState } from 'react';
import { CheckSquare, Search } from 'lucide-react';
import { RoutineItem } from '@ui/Components/Routine/RoutineItem';
import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { StatHint } from '@ui/Components/Stats/StatHint';
import { TaskSidebar } from '@ui/Components/Task/TaskSidebar';
import { TaskTable } from '@ui/Components/Task/TaskTable';
import { useTasks } from '@ui/Hooks/Task/useTasks';
import { useTaskFilters, STATUS_TABS } from '@ui/Hooks/Task/useTaskFilters';
import { useRoutines } from '@ui/Hooks/Routine/useRoutines';
import { useStats } from '@ui/Hooks/Stats/useStats';
import { formatDuration } from '@ui/Hooks/Stats/statsUtils';

const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function DashboardScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { search, setSearch, statusFilter, setStatusFilter, applyFilters } = useTaskFilters();

  const { isLoading, createTask, updateTask, toggleTask, postponeTask, reorderTask, deleteTask } = useTasks();
  const { editRoutine, removeRoutine } = useRoutines();
  const {
    focusTimes, tasks, routines,
    todayMinutes, todaySessionCount,
    weekMinutes, weekSessionCount,
    weekBars,
    currentStreak,
    avgSessionMinutes,
    todayTasks, todayDone, todayTotal, pending,
    totalDone, globalCompletionRate,
    totalEstimatedMinutes, totalFocusMinutes,
  } = useStats();

  const weekBarsMax = Math.max(...weekBars, 1);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Tableau de bord</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Bon retour 👋
            </p>
          </div>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-foreground"
          >
            <CheckSquare size={15} />
            <span>Tâches</span>
            {pending > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {pending}
              </span>
            )}
          </button>
        </div>

        <div className="space-y-5 px-8 pb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Focus aujourd'hui<StatHint text="Durée totale des sessions de focus complétées aujourd'hui." /></p>
              <p className="mt-1 text-2xl font-bold text-orange-400">{formatDuration(todayMinutes)}</p>
              <p className="mt-1 text-xs text-subtle-foreground">
                {todaySessionCount} session{todaySessionCount > 1 ? 's' : ''}
              </p>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Cette semaine<StatHint text="Durée totale de focus depuis le lundi de cette semaine." /></p>
              <p className="mt-1 text-2xl font-bold text-blue-400">{formatDuration(weekMinutes)}</p>
              <p className="mt-1 text-xs text-subtle-foreground">{weekSessionCount} session{weekSessionCount > 1 ? 's' : ''}</p>
            </div>
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Tâches accomplies<StatHint text="Tâches terminées aujourd'hui sur le total des tâches planifiées pour aujourd'hui." /></p>
              <p className="mt-1 text-2xl font-bold text-green-400">{todayDone} / {todayTotal}</p>
              <p className="mt-1 text-xs text-subtle-foreground">
                {pending > 0 ? `${pending} restante${pending > 1 ? 's' : ''} aujourd'hui` : "Toutes les tâches sont faites !"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Streak focus<StatHint text="Nombre de jours consécutifs avec au moins une session de focus complétée." /></p>
              <p className="mt-1 text-2xl font-bold text-violet-400">{currentStreak} jour{currentStreak !== 1 ? 's' : ''}</p>
              <p className="mt-1 text-xs text-subtle-foreground">
                {currentStreak === 0 ? "Aucune session aujourd'hui" : 'Jours consécutifs'}
              </p>
            </div>
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Moy. par session<StatHint text="Durée moyenne de toutes tes sessions de focus, toutes dates confondues." /></p>
              <p className="mt-1 text-2xl font-bold text-yellow-400">{formatDuration(avgSessionMinutes)}</p>
              <p className="mt-1 text-xs text-subtle-foreground">
                {focusTimes.length} session{focusTimes.length !== 1 ? 's' : ''} au total
              </p>
            </div>
            <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Complétion globale<StatHint text="Pourcentage de tâches marquées comme terminées sur l'ensemble de tes tâches." /></p>
              <p className="mt-1 text-2xl font-bold text-teal-400">{globalCompletionRate}%</p>
              <p className="mt-1 text-xs text-subtle-foreground">
                {totalDone} / {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Tâches du jour en cours</h2>
              {isLoading ? (
                <p className="py-6 text-center text-sm text-subtle-foreground">Chargement…</p>
              ) : (
                <TaskTable
                  tasks={todayTasks.filter((t) => !t.done)}
                  onToggle={toggleTask}
                  emptyLabel="Aucune tâche en cours aujourd'hui"
                  compact
                />
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Liste quotidienne</h2>
                {routines.length > 0 && (
                  <span className="rounded-full bg-elevated px-2 py-0.5 text-xs text-muted-foreground">{routines.length}</span>
                )}
              </div>
              {routines.length === 0 ? (
                <p className="py-4 text-center text-xs text-subtle-foreground">Aucune routine configurée</p>
              ) : (
                <ul className="space-y-2">
                  {routines.slice(0, 5).map((routine) => (
                    <RoutineItem
                      key={routine.id}
                      routine={routine}
                      onEdit={editRoutine}
                      onDelete={removeRoutine}
                      onCreateTask={(t) => createTask(t, '', 'moyenne', '', 'today')}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Toutes les tâches</h2>
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    + Ajouter
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-36">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-foreground" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Rechercher…"
                      className="w-full rounded-lg border border-input bg-elevated py-1.5 pl-8 pr-3 text-xs text-foreground placeholder-subtle-foreground focus:border-accent-hover focus:outline-none focus:ring-1 focus:ring-accent-hover"
                    />
                  </div>
                  <div className="flex items-center rounded-lg border border-border bg-elevated p-0.5">
                    {STATUS_TABS.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          statusFilter === key ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {isLoading ? (
                <p className="py-6 text-center text-sm text-subtle-foreground">Chargement…</p>
              ) : (
                <TaskTable tasks={applyFilters(tasks)} onToggle={toggleTask} />
              )}
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground">Analytique</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-xl font-bold text-foreground">{weekSessionCount}</p>
                  <p className="text-xs text-muted-foreground">Sessions cette semaine</p>
                </div>
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-lg font-bold text-foreground">{formatDuration(weekMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Temps de focus</p>
                </div>
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-lg font-bold text-foreground">{formatDuration(totalEstimatedMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Temps estimé (tâches)</p>
                </div>
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-lg font-bold text-foreground">{formatDuration(totalFocusMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Focus réel (total)</p>
                </div>
              </div>
              <div className="flex flex-1 items-end gap-1">
                {weekBars.map((minutes, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm bg-accent/70"
                      style={{ height: `${(minutes / weekBarsMax) * 72}px` }}
                    />
                    <span className="text-[9px] text-subtle-foreground">{days[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <TaskSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        tasks={tasks}
        onToggle={toggleTask}
        onAdd={(title, description, priority, estimatedTime) => createTask(title, description, priority, estimatedTime, 'today')}
        onUpdate={updateTask}
        onReorder={reorderTask}
        onPostpone={postponeTask}
        onDelete={deleteTask}
      />
    </div>
  );
}
