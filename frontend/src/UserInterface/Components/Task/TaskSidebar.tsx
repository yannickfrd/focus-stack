'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus, ArrowUpDown } from 'lucide-react';
import { TaskItem, type Task, type Priority } from './TaskItem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onToggle: (id: number) => void;
  onAdd: (title: string, description: string, priority: Priority, estimatedTime: string) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, changes: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'estimatedTime'>>) => void;
  onReorder: (draggedId: number, targetId: number, position: 'before' | 'after') => void;
  onPostpone: (id: number) => void;
}

const PRIORITY_ORDER: Record<Priority, number> = { haute: 0, moyenne: 1, basse: 2 };

export function TaskSidebar({ isOpen, onClose, tasks, onToggle, onAdd, onDelete, onUpdate, onReorder, onPostpone }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('moyenne');
  const [newEstimate, setNewEstimate] = useState('');
  const [sorted, setSorted] = useState(false);
  const [pendingMove, setPendingMove] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => { timeouts.forEach(clearTimeout); };
  }, []);

  const handleToggle = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (!task.done) {
      setPendingMove((prev) => new Set([...prev, id]));
      const timeout = setTimeout(() => {
        setPendingMove((prev) => { const next = new Set(prev); next.delete(id); return next; });
        timeoutsRef.current.delete(id);
      }, 5000);
      timeoutsRef.current.set(id, timeout);
    } else {
      const existing = timeoutsRef.current.get(id);
      if (existing) { clearTimeout(existing); timeoutsRef.current.delete(id); }
      setPendingMove((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }

    onToggle(id);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim(), newDescription.trim(), newPriority, newEstimate.trim());
    setNewTitle('');
    setNewDescription('');
    setNewEstimate('');
  };

  const allDisplayed = sorted
    ? [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    : tasks;

  const pendingTasks = allDisplayed.filter((t) => !t.done || pendingMove.has(t.id));
  const doneTasks = allDisplayed.filter((t) => t.done && !pendingMove.has(t.id));
  const done = tasks.filter((t) => t.done).length;

  const renderTask = (task: Task) => (
    <TaskItem
      key={task.id}
      task={task}
      onToggle={handleToggle}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onReorder={onReorder}
      onPostpone={onPostpone}
    />
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-84 flex-col border-l border-border bg-card shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Tâches du jour</h2>
            <p className="mt-0.5 text-xs text-subtle-foreground">
              {done} / {tasks.length} accomplies
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSorted((s) => !s)}
              className={`cursor-pointer rounded-lg p-1.5 transition-all ${
                sorted
                  ? 'bg-accent/10 text-accent hover:bg-accent/20'
                  : 'text-muted-foreground hover:bg-elevated hover:text-foreground'
              }`}
              aria-label="Trier par priorité"
              title="Trier par priorité"
            >
              <ArrowUpDown size={14} />
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto py-3">
          {tasks.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-subtle-foreground">
              Aucune tâche pour aujourd'hui
            </p>
          ) : (
            <>
              <ul className="space-y-2 px-4">
                {pendingTasks.map(renderTask)}
              </ul>

              {doneTasks.length > 0 && (
                <div className="mt-4 px-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
                      Accomplies ({doneTasks.length})
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <ul className="space-y-2">
                    {doneTasks.map(renderTask)}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-border p-4">
          <form onSubmit={handleAdd} className="space-y-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Titre de la tâche…"
              className="w-full rounded-lg border border-input bg-elevated px-3 py-2 text-sm text-foreground placeholder-subtle-foreground focus:border-accent-hover focus:outline-none focus:ring-1 focus:ring-accent-hover"
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (facultatif)…"
              rows={2}
              className="w-full resize-none rounded-lg border border-input bg-elevated px-3 py-2 text-sm text-foreground placeholder-subtle-foreground focus:border-accent-hover focus:outline-none focus:ring-1 focus:ring-accent-hover"
            />
            <input
              type="text"
              value={newEstimate}
              onChange={(e) => setNewEstimate(e.target.value)}
              placeholder="Estimation (ex: 30min, 2h)…"
              className="w-full rounded-lg border border-input bg-elevated px-3 py-2 text-sm text-foreground placeholder-subtle-foreground focus:border-accent-hover focus:outline-none focus:ring-1 focus:ring-accent-hover"
            />
            <div className="flex gap-2">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="flex-1 rounded-lg border border-input bg-elevated px-2 py-2 text-xs text-foreground focus:outline-none"
              >
                <option value="haute">Haute</option>
                <option value="moyenne">Moyenne</option>
                <option value="basse">Basse</option>
              </select>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={14} />
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
}
