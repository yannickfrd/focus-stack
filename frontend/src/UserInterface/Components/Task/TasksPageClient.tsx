'use client';

import { useState } from 'react';
import { CheckSquare, Search } from 'lucide-react';
import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { TaskSidebar } from '@ui/Components/Task/TaskSidebar';
import { TaskTable } from '@ui/Components/Task/TaskTable';
import { useTasks } from '@ui/Hooks/Task/useTasks';

type StatusFilter = 'all' | 'pending' | 'done';

export function TasksPageClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { tasks, isLoading, createTask, updateTask, toggleTask, postponeTask, reorderTask, deleteTask } = useTasks();

  const todayTasks = tasks.filter((t) => !t.scheduledFor || t.scheduledFor === 'today');
  const tomorrowTasks = tasks.filter((t) => t.scheduledFor === 'tomorrow');
  const pending = todayTasks.filter((t) => !t.done).length;

  const applyFilters = (list: typeof tasks) =>
    list
      .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => statusFilter === 'all' || (statusFilter === 'done' ? t.done : !t.done));

  const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En cours' },
    { key: 'done', label: 'Terminées' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Liste des tâches</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Gérez vos tâches du jour et de demain</p>
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
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Tâches du jour</h2>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
              >
                + Ajouter
              </button>
            </div>
            {isLoading ? (
              <p className="py-6 text-center text-sm text-subtle-foreground">Chargement…</p>
            ) : (
              <TaskTable tasks={todayTasks} onToggle={toggleTask} emptyLabel="Aucune tâche pour aujourd'hui" />
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Tâches de demain</h2>
            {isLoading ? (
              <p className="py-6 text-center text-sm text-subtle-foreground">Chargement…</p>
            ) : (
              <TaskTable tasks={tomorrowTasks} onToggle={toggleTask} emptyLabel="Aucune tâche pour demain" />
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Toutes les tâches</h2>
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
              <TaskTable tasks={applyFilters(tasks)} onToggle={toggleTask} emptyLabel="Aucune tâche" />
            )}
          </div>
        </div>
      </main>

      <TaskSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        tasks={todayTasks}
        onToggle={toggleTask}
        onAdd={(title, description, priority, estimatedTime) => createTask(title, description, priority, estimatedTime, 'today')}
        onDelete={deleteTask}
        onUpdate={updateTask}
        onReorder={reorderTask}
        onPostpone={postponeTask}
      />
    </div>
  );
}
