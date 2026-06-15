'use client';

import { useState } from 'react';
import { CheckSquare, Search } from 'lucide-react';
import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { TaskSidebar } from '@ui/Components/Task/TaskSidebar';
import { TaskTable } from '@ui/Components/Task/TaskTable';
import type { Task, Priority } from '@ui/Components/Task/TaskItem';

const dt = (daysAgo: number) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d; };

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Terminer la documentation API', description: 'Relire les endpoints swagger et mettre à jour le typage TypeScript.', priority: 'haute', done: true, scheduledFor: 'today', createdAt: dt(3), estimatedTime: '2h' },
  { id: 2, title: "Concevoir la page d'accueil", description: "Maquette Figma validée — passer à l'intégration.", priority: 'moyenne', done: true, scheduledFor: 'today', createdAt: dt(1), estimatedTime: '3h' },
  { id: 3, title: 'Revoir les pull requests', description: 'Backend + frontend à merger avant lundi.', priority: 'haute', done: false, scheduledFor: 'today', createdAt: dt(0), estimatedTime: '1h' },
  { id: 4, title: 'Notes de standup équipe', priority: 'basse', done: false, scheduledFor: 'today', createdAt: dt(0) },
  { id: 5, title: 'Déployer en staging', description: "Vérifier les variables d'env avant le push.", priority: 'moyenne', done: false, scheduledFor: 'today', createdAt: dt(2), estimatedTime: '30min' },
  { id: 6, title: 'Rédiger les specs techniques', description: 'Pour la nouvelle feature de notifications push.', priority: 'haute', done: false, scheduledFor: 'tomorrow', createdAt: dt(0), estimatedTime: '4h' },
  { id: 7, title: 'Revue de code frontend', description: 'Composants dashboard et sidebar.', priority: 'moyenne', done: false, scheduledFor: 'tomorrow', createdAt: dt(1), estimatedTime: '1h30' },
  { id: 8, title: 'Mettre à jour les dépendances', priority: 'basse', done: false, scheduledFor: 'tomorrow', createdAt: dt(0) },
];

type StatusFilter = 'all' | 'pending' | 'done';

export function TasksPageClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const toggleTask = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const addTask = (title: string, description: string, priority: Priority, estimatedTime: string) =>
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title, description: description || undefined, priority, done: false, scheduledFor: 'today' as const, createdAt: new Date(), estimatedTime: estimatedTime || undefined },
    ]);

  const deleteTask = (id: number) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const updateTask = (id: number, changes: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'estimatedTime'>>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));

  const reorderTask = (draggedId: number, targetId: number, position: 'before' | 'after') =>
    setTasks((prev) => {
      const items = [...prev];
      const from = items.findIndex((t) => t.id === draggedId);
      const [moved] = items.splice(from, 1);
      const to = items.findIndex((t) => t.id === targetId);
      items.splice(position === 'before' ? to : to + 1, 0, moved);
      return items;
    });

  const postponeTask = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, scheduledFor: 'tomorrow' as const } : t)));

  const applyFilters = (list: Task[]) =>
    list
      .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => statusFilter === 'all' || (statusFilter === 'done' ? t.done : !t.done));

  const todayTasks = tasks.filter((t) => !t.scheduledFor || t.scheduledFor === 'today');
  const tomorrowTasks = tasks.filter((t) => t.scheduledFor === 'tomorrow');
  const pending = todayTasks.filter((t) => !t.done).length;

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

        {/* Barre de recherche + filtre statut */}
        <div className="flex items-center gap-3 px-8 pb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une tâche…"
              className="w-full rounded-lg border border-input bg-elevated py-2 pl-8 pr-3 text-sm text-foreground placeholder-subtle-foreground focus:border-accent-hover focus:outline-none focus:ring-1 focus:ring-accent-hover"
            />
          </div>
          <div className="flex items-center rounded-lg border border-border bg-elevated p-0.5">
            {STATUS_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === key
                    ? 'bg-accent text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
            <TaskTable tasks={applyFilters(todayTasks)} onToggle={toggleTask} emptyLabel="Aucune tâche pour aujourd'hui" />
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Tâches de demain</h2>
            <TaskTable tasks={applyFilters(tomorrowTasks)} onToggle={toggleTask} emptyLabel="Aucune tâche pour demain" />
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Toutes les tâches</h2>
            <TaskTable tasks={applyFilters(tasks)} onToggle={toggleTask} emptyLabel="Aucune tâche" />
          </div>
        </div>
      </main>

      <TaskSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        tasks={todayTasks}
        onToggle={toggleTask}
        onAdd={(title, description, priority, estimatedTime) => addTask(title, description, priority, estimatedTime)}
        onDelete={deleteTask}
        onUpdate={updateTask}
        onReorder={reorderTask}
        onPostpone={postponeTask}
      />
    </div>
  );
}
