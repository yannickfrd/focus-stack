'use client';

import { useState, useRef } from 'react';
import { Trash2, CalendarClock, Clock, Timer } from 'lucide-react';
import { CheckIcon } from '@ui/Components/Icons/CheckIcon';
import { TimeEstimatePicker } from './TimeEstimatePicker';
import { ConfirmDialog } from '@ui/Components/Common/ConfirmDialog';
import type { Task, Priority } from '@domain/Entities/Task/Task';

export type { Task, Priority };

const PRIORITY_STYLES: Record<Priority, string> = {
  haute: 'bg-red-500/10 text-red-400',
  moyenne: 'bg-yellow-500/10 text-yellow-400',
  basse: 'bg-green-500/10 text-green-400',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  haute: 'Haute',
  moyenne: 'Moyenne',
  basse: 'Basse',
};

interface Props {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, changes: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'estimatedTime'>>) => void;
  onReorder: (draggedId: number, targetId: number, position: 'before' | 'after') => void;
  onPostpone: (id: number) => void;
  onFocus?: (id: number) => void;
}

export function TaskItem({ task, onToggle, onDelete, onUpdate, onReorder, onPostpone, onFocus }: Props) {
  const liRef = useRef<HTMLLIElement>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [descDraft, setDescDraft] = useState(task.description ?? '');

  const saveTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.title) onUpdate(task.id, { title: trimmed });
    else setTitleDraft(task.title);
    setEditingTitle(false);
  };

  const saveDescription = () => {
    const trimmed = descDraft.trim();
    if (trimmed !== (task.description ?? '')) onUpdate(task.id, { description: trimmed || undefined });
    setEditingDescription(false);
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const getDropPosition = (e: React.DragEvent): 'above' | 'below' => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientY < rect.top + rect.height / 2 ? 'above' : 'below';
  };

  return (
    <li
      ref={liRef}
      draggable
      onDragStart={(e) => {
        const target = e.target as HTMLElement;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) { e.preventDefault(); return; }
        e.dataTransfer.setData('taskId', String(task.id));
        e.dataTransfer.effectAllowed = 'move';
        if (liRef.current) liRef.current.style.opacity = '0.4';
      }}
      onDragEnd={() => { if (liRef.current) liRef.current.style.opacity = ''; }}
      onDragOver={(e) => { e.preventDefault(); setDropPosition(getDropPosition(e)); }}
      onDragLeave={() => setDropPosition(null)}
      onDrop={(e) => {
        e.preventDefault();
        const pos = getDropPosition(e);
        setDropPosition(null);
        const draggedId = Number(e.dataTransfer.getData('taskId'));
        if (draggedId !== task.id) onReorder(draggedId, task.id, pos === 'above' ? 'before' : 'after');
      }}
      className={`relative group cursor-grab rounded-xl border p-3 transition-colors active:cursor-grabbing ${
        task.done ? 'border-border bg-elevated/40' : 'border-border bg-elevated'
      }`}
    >
      {dropPosition === 'above' && (
        <div className="pointer-events-none absolute -top-[5px] left-2 right-2 z-10 h-0.5 rounded-full bg-accent" />
      )}
      {dropPosition === 'below' && (
        <div className="pointer-events-none absolute -bottom-[5px] left-2 right-2 z-10 h-0.5 rounded-full bg-accent" />
      )}

      {/* Ligne 1 : méta à gauche, actions à droite */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {editingPriority ? (
            <select
              autoFocus
              value={task.priority}
              onChange={(e) => { onUpdate(task.id, { priority: e.target.value as Priority }); setEditingPriority(false); }}
              onBlur={() => setEditingPriority(false)}
              className={`cursor-pointer rounded px-1 py-0.5 text-[10px] font-medium outline-none ${PRIORITY_STYLES[task.priority]}`}
            >
              <option value="haute">Haute</option>
              <option value="moyenne">Moyenne</option>
              <option value="basse">Basse</option>
            </select>
          ) : (
            <div className="relative group/priority">
              <span
                onClick={() => setEditingPriority(true)}
                className={`cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-70 ${PRIORITY_STYLES[task.priority]}`}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
              <span className="pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity group-hover/priority:opacity-100 z-20">
                Changer la priorité
              </span>
            </div>
          )}

          <span className="text-[10px] text-subtle-foreground/50">{formatDate(task.createdAt)}</span>

          <div className="relative group/estimate">
            {editingEstimate ? (
              <TimeEstimatePicker
                value={task.estimatedTime}
                onChange={(val) => onUpdate(task.id, { estimatedTime: val })}
                onBlur={() => setEditingEstimate(false)}
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingEstimate(true)}
                className="flex cursor-pointer items-center gap-1 rounded p-0.5 text-subtle-foreground transition-colors hover:text-foreground"
              >
                <Clock size={10} />
                <span className="text-[10px]">{task.estimatedTime ?? '—'}</span>
              </button>
            )}
            {!editingEstimate && (
              <span className="pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity group-hover/estimate:opacity-100 z-20">
                Estimation
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {!task.done && onFocus && (
            <div className="relative group/focus">
              <button
                onClick={() => onFocus(task.id)}
                className="cursor-pointer rounded p-1 text-subtle-foreground transition-colors hover:text-accent"
                aria-label="Démarrer une session focus"
              >
                <Timer size={13} />
              </button>
              <span className="pointer-events-none absolute top-full right-0 mt-1.5 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity group-hover/focus:opacity-100 z-20">
                Mode Focus
              </span>
            </div>
          )}

          <div className="relative group/postpone">
            <button
              onClick={() => onPostpone(task.id)}
              className={`cursor-pointer rounded p-1 transition-colors ${
                task.scheduledFor === 'tomorrow'
                  ? 'text-accent hover:text-accent/70'
                  : 'text-subtle-foreground hover:text-blue-400'
              }`}
              aria-label={task.scheduledFor === 'tomorrow' ? 'Ramener à aujourd\'hui' : 'Reporter à demain'}
            >
              <CalendarClock size={13} />
            </button>
            <span className="pointer-events-none absolute top-full right-0 mt-1.5 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity group-hover/postpone:opacity-100 z-20">
              {task.scheduledFor === 'tomorrow' ? 'À faire aujourd\'hui' : 'Reporter à demain'}
            </span>
          </div>

          <div className="relative group/delete">
            <button
              onClick={() => setConfirmDelete(true)}
              className="cursor-pointer rounded p-1 text-subtle-foreground transition-colors hover:text-red-400"
              aria-label="Supprimer la tâche"
            >
              <Trash2 size={13} />
            </button>
            <span className="pointer-events-none absolute top-full right-0 mt-1.5 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity group-hover/delete:opacity-100 z-20">
              Supprimer
            </span>
          </div>

          {confirmDelete && (
            <ConfirmDialog
              title="Supprimer la tâche"
              message={`« ${task.title} » sera définitivement supprimée. Cette action est irréversible.`}
              confirmLabel="Supprimer"
              onConfirm={() => { setConfirmDelete(false); onDelete(task.id); }}
              onCancel={() => setConfirmDelete(false)}
            />
          )}
        </div>
      </div>

      {/* Ligne 2 : checkbox + titre */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(task.id)}
          className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
            task.done ? 'border-accent bg-accent' : 'border-input hover:border-accent/50'
          }`}
          aria-label={task.done ? 'Marquer comme non faite' : 'Marquer comme faite'}
        >
          {task.done && <CheckIcon className="h-2.5 w-2.5 text-white" />}
        </button>

        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle();
              if (e.key === 'Escape') { setTitleDraft(task.title); setEditingTitle(false); }
            }}
            className="flex-1 rounded bg-background px-1 text-sm font-medium text-foreground outline-none ring-1 ring-accent/50"
          />
        ) : (
          <span
            onClick={() => { setTitleDraft(task.title); setEditingTitle(true); }}
            className={`flex-1 cursor-text text-sm font-medium leading-tight ${
              task.done ? 'text-subtle-foreground line-through' : 'text-foreground/90'
            }`}
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Ligne 3 : description */}
      <div className="mt-1.5 pl-6">
        {editingDescription ? (
          <textarea
            autoFocus
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={saveDescription}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setDescDraft(task.description ?? ''); setEditingDescription(false); }
            }}
            rows={2}
            className="w-full resize-none rounded bg-background px-1 py-0.5 text-xs text-foreground outline-none ring-1 ring-accent/50"
          />
        ) : task.description ? (
          <p
            onClick={() => { setDescDraft(task.description ?? ''); setEditingDescription(true); }}
            className={`cursor-text text-xs leading-relaxed ${
              task.done ? 'text-subtle-foreground/60' : 'text-muted-foreground'
            }`}
          >
            {task.description}
          </p>
        ) : (
          <p
            onClick={() => { setDescDraft(''); setEditingDescription(true); }}
            className="cursor-text text-xs text-subtle-foreground/40 hover:text-subtle-foreground/60"
          >
            Ajouter une description…
          </p>
        )}
      </div>
    </li>
  );
}
