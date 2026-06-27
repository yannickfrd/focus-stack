'use client';

import { useState } from 'react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@ui/Components/Common/ConfirmDialog';
import type { Routine } from '@domain/Entities/Routine/Routine';

interface Props {
  routine: Routine;
  onEdit: (id: string, title: string, color: string | null) => void;
  onDelete: (id: string) => void;
  onCreateTask: (title: string) => void;
}

export function RoutineItem({ routine, onEdit, onDelete, onCreateTask }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== routine.title) onEdit(routine.id, trimmed, routine.color);
    setEditing(false);
  };

  return (
    <li className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-elevated">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: routine.color ?? '#6b7280' }}
      />

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="flex-1 rounded bg-background px-1 text-sm text-foreground outline-none ring-1 ring-accent/50"
        />
      ) : (
        <span
          onClick={() => { setDraft(routine.title); setEditing(true); }}
          className="flex-1 cursor-text text-sm text-foreground/70"
        >
          {routine.title}
        </span>
      )}

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onCreateTask(routine.title)}
          title="Créer une tâche"
          className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent-dim"
        >
          <ArrowRight size={13} />
          <span>Tâche</span>
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          title="Supprimer"
          className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer la routine"
          message={`« ${routine.title} » sera définitivement supprimée.`}
          onConfirm={() => { setConfirmDelete(false); onDelete(routine.id); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </li>
  );
}
