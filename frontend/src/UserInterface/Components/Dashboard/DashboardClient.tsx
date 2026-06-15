'use client';

import { useState } from 'react';
import { CheckSquare, Search } from 'lucide-react';
import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { TaskSidebar } from '@ui/Components/Task/TaskSidebar';
import { TaskTable } from '@ui/Components/Task/TaskTable';
import type { Task, Priority } from '@ui/Components/Task/TaskItem';

const stats = [
  {
    label: "Focus aujourd'hui",
    value: '2h 45m',
    delta: '+12 min vs hier',
    accent: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
  },
  {
    label: 'Série en cours',
    value: '7 jours',
    delta: 'Record personnel : 14 jours',
    accent: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  },
  {
    label: 'Tâches accomplies',
    value: '12 / 15',
    delta: "3 restantes aujourd'hui",
    accent: 'border-green-500/20 bg-green-500/10 text-green-400',
  },
];

const dailyItems = [
  { id: 1, title: 'Routine matinale', dot: 'bg-green-500' },
  { id: 2, title: 'Session de travail profond', dot: 'bg-accent' },
  { id: 3, title: 'Revue des emails', dot: 'bg-yellow-500' },
  { id: 4, title: 'Exercice', dot: 'bg-blue-500' },
  { id: 5, title: 'Lecture', dot: 'bg-orange-500' },
];


const weekBars = [3, 5, 4, 7, 6, 8, 5];
const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const d = (daysAgo: number) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d; };

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Terminer la documentation API', description: 'Relire les endpoints swagger et mettre à jour le typage TypeScript.', priority: 'haute', done: true, scheduledFor: 'today', createdAt: d(3), estimatedTime: '2h' },
  { id: 2, title: "Concevoir la page d'accueil", description: "Maquette Figma validée — passer à l'intégration.", priority: 'moyenne', done: true, scheduledFor: 'today', createdAt: d(1), estimatedTime: '3h' },
  { id: 3, title: 'Revoir les pull requests', description: 'Backend + frontend à merger avant lundi.', priority: 'haute', done: false, scheduledFor: 'today', createdAt: d(0), estimatedTime: '1h' },
  { id: 4, title: 'Notes de standup équipe', priority: 'basse', done: false, scheduledFor: 'today', createdAt: d(0) },
  { id: 5, title: 'Déployer en staging', description: "Vérifier les variables d'env avant le push.", priority: 'moyenne', done: false, scheduledFor: 'today', createdAt: d(2), estimatedTime: '30min' },
];

type StatusFilter = 'all' | 'pending' | 'done';

export function DashboardClient() {
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

  const updateTask = (id: number, changes: Partial<Pick<Task, 'title' | 'description' | 'priority'>>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));

  const postponeTask = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, scheduledFor: 'tomorrow' as const } : t)));

  const reorderTask = (draggedId: number, targetId: number, position: 'before' | 'after') =>
    setTasks((prev) => {
      const items = [...prev];
      const from = items.findIndex((t) => t.id === draggedId);
      const [moved] = items.splice(from, 1);
      const to = items.findIndex((t) => t.id === targetId);
      items.splice(position === 'before' ? to : to + 1, 0, moved);
      return items;
    });

  const pending = tasks.filter((t) => !t.done).length;

  const applyFilters = (list: Task[]) =>
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
            {stats.map((s) => (
              <div key={s.label} className={`rounded-xl border p-5 ${s.accent.split(' ').slice(0, 2).join(' ')}`}>
                <p className="text-xs uppercase tracking-wide text-subtle-foreground">{s.label}</p>
                <p className={`mt-1 text-2xl font-bold ${s.accent.split(' ')[2]}`}>{s.value}</p>
                <p className="mt-1 text-xs text-subtle-foreground">{s.delta}</p>
              </div>
            ))}
          </div>

          {/* Barre recherche + filtre */}
          <div className="flex items-center gap-3">
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
                    statusFilter === key ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Tâches du jour en cours</h2>
              <TaskTable
                tasks={tasks.filter((t) => (!t.scheduledFor || t.scheduledFor === 'today') && !t.done)}
                onToggle={toggleTask}
                emptyLabel="Aucune tâche en cours aujourd'hui"
                compact
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Liste quotidienne</h2>
                <span className="text-xs text-subtle-foreground">Groupe 1</span>
              </div>
              <ul className="space-y-3">
                {dailyItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`} />
                    <span className="text-sm text-foreground/70">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Toutes les tâches</h2>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  + Ajouter
                </button>
              </div>
              <TaskTable tasks={applyFilters(tasks)} onToggle={toggleTask} />
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground">Analytique</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-xl font-bold text-foreground">23</p>
                  <p className="text-xs text-muted-foreground">Tâches cette semaine</p>
                </div>
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-lg font-bold text-foreground">12h 45m</p>
                  <p className="text-xs text-muted-foreground">Temps de focus</p>
                </div>
              </div>
              <div className="flex flex-1 items-end gap-1">
                {weekBars.map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-sm bg-accent/70" style={{ height: `${(h / 8) * 72}px` }} />
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
        onAdd={(title, description, priority, estimatedTime) => addTask(title, description, priority, estimatedTime)}
        onUpdate={updateTask}
        onReorder={reorderTask}
        onPostpone={postponeTask}
        onDelete={deleteTask}
      />
    </div>
  );
}
