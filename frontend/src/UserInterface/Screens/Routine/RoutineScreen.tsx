'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { RoutineItem } from '@ui/Components/Routine/RoutineItem';
import { useRoutines } from '@ui/Hooks/Routine/useRoutines';
import { useTasks } from '@ui/Hooks/Task/useTasks';

export function RoutineScreen() {
  const { routines, isLoading, addRoutine, editRoutine, removeRoutine } = useRoutines();
  const { createTask } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    addRoutine(trimmed);
    setTitle('');
    setShowForm(false);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Liste quotidienne</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Vos routines récurrentes</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-foreground"
          >
            <Plus size={15} />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="px-8 pb-8">
          <div className="rounded-xl border border-border bg-card p-5">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-subtle-foreground">Chargement…</p>
            ) : (
              <ul className="space-y-2">
                {showForm && (
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-border" />
                    <input
                      autoFocus
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd();
                        if (e.key === 'Escape') { setShowForm(false); setTitle(''); }
                      }}
                      placeholder="Nom de la routine…"
                      className="flex-1 rounded-lg border border-input bg-elevated px-3 py-1.5 text-sm text-foreground placeholder-subtle-foreground focus:border-accent-hover focus:outline-none focus:ring-1 focus:ring-accent-hover"
                    />
                    <button
                      onClick={handleAdd}
                      className="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => { setShowForm(false); setTitle(''); }}
                      className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                    >
                      Annuler
                    </button>
                  </li>
                )}

                {routines.length === 0 && !showForm && (
                  <li className="py-6 text-center text-sm text-subtle-foreground">
                    Aucune routine — ajoutez-en une pour commencer.
                  </li>
                )}

                {routines.map((routine) => (
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
      </main>
    </div>
  );
}
