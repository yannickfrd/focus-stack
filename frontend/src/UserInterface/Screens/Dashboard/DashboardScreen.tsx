'use client';

import { useState } from 'react';
import { CheckSquare, Search } from 'lucide-react';
import { RoutineItem } from '@ui/Components/Routine/RoutineItem';
import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { TaskSidebar } from '@ui/Components/Task/TaskSidebar';
import { TaskTable } from '@ui/Components/Task/TaskTable';
import { useTasks } from '@ui/Hooks/Task/useTasks';
import { useTaskFilters, STATUS_TABS } from '@ui/Hooks/Task/useTaskFilters';
import { useFocusTime } from '@ui/Hooks/Focus/useFocusTime';
import { useRoutines } from '@ui/Hooks/Routine/useRoutines';

const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

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

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function DashboardScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { search, setSearch, statusFilter, setStatusFilter, applyFilters } = useTaskFilters();

  const { tasks, isLoading, createTask, updateTask, toggleTask, postponeTask, reorderTask, deleteTask } = useTasks();
  const { focusTimes } = useFocusTime();
  const { routines, editRoutine, removeRoutine } = useRoutines();

  const todayTasks = tasks.filter((t) => !t.scheduledFor || t.scheduledFor === 'today');
  const todayDone = todayTasks.filter((t) => t.done).length;
  const todayTotal = todayTasks.length;
  const pending = todayTasks.filter((t) => !t.done).length;

  const now = new Date();
  const weekStart = getWeekStart(now);

  const todayMinutes = focusTimes
    .filter((ft) => isSameDay(ft.completedAt, now))
    .reduce((sum, ft) => sum + ft.duration, 0);

  const weekSessions = focusTimes.filter((ft) => ft.completedAt >= weekStart);
  const weekMinutes = weekSessions.reduce((sum, ft) => sum + ft.duration, 0);

  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return focusTimes
      .filter((ft) => isSameDay(ft.completedAt, day))
      .reduce((sum, ft) => sum + ft.duration, 0);
  });
  const weekBarsMax = Math.max(...weekBars, 1);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Tableau de bord</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Bon retour, <span className="font-medium text-foreground">Alexandra</span> 👋
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
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Focus aujourd'hui</p>
              <p className="mt-1 text-2xl font-bold text-orange-400">{formatDuration(todayMinutes)}</p>
              <p className="mt-1 text-xs text-subtle-foreground">
                {focusTimes.filter((ft) => isSameDay(ft.completedAt, now)).length} session{focusTimes.filter((ft) => isSameDay(ft.completedAt, now)).length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Cette semaine</p>
              <p className="mt-1 text-2xl font-bold text-blue-400">{formatDuration(weekMinutes)}</p>
              <p className="mt-1 text-xs text-subtle-foreground">{weekSessions.length} session{weekSessions.length > 1 ? 's' : ''}</p>
            </div>
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
              <p className="text-xs uppercase tracking-wide text-subtle-foreground">Tâches accomplies</p>
              <p className="mt-1 text-2xl font-bold text-green-400">{todayDone} / {todayTotal}</p>
              <p className="mt-1 text-xs text-subtle-foreground">
                {pending > 0 ? `${pending} restante${pending > 1 ? 's' : ''} aujourd'hui` : "Toutes les tâches sont faites !"}
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
              <h2 className="mb-3 text-sm font-semibold text-foreground">Liste quotidienne</h2>
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
                  <p className="text-xl font-bold text-foreground">{weekSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Sessions cette semaine</p>
                </div>
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-lg font-bold text-foreground">{formatDuration(weekMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Temps de focus</p>
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
