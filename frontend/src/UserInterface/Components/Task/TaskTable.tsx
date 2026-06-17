'use client';

import { useState } from 'react';
import { Clock, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { CheckIcon } from '@ui/Components/Icons/CheckIcon';
import type { Task } from './TaskItem';

const PRIORITY_STYLES: Record<string, string> = {
  haute: 'bg-red-500/10 text-red-400',
  moyenne: 'bg-yellow-500/10 text-yellow-400',
  basse: 'bg-green-500/10 text-green-400',
};

const PRIORITY_WEIGHT: Record<string, number> = { haute: 0, moyenne: 1, basse: 2 };

type SortKey = 'title' | 'priority' | 'estimatedTime' | 'createdAt' | 'done';
type SortDir = 'asc' | 'desc';

const formatDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown size={11} className="opacity-30" />;
  return dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
}

interface Props {
  tasks: Task[];
  onToggle: (id: number) => void;
  emptyLabel?: string;
  compact?: boolean;
}

export function TaskTable({ tasks, onToggle, emptyLabel = 'Aucune tâche', compact = false }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...tasks].sort((a, b) => {
    if (!sortKey) return 0;
    let cmp = 0;
    switch (sortKey) {
      case 'title': cmp = a.title.localeCompare(b.title, 'fr'); break;
      case 'priority': cmp = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]; break;
      case 'estimatedTime': cmp = (a.estimatedTime ?? '').localeCompare(b.estimatedTime ?? '', 'fr'); break;
      case 'createdAt': cmp = a.createdAt.getTime() - b.createdAt.getTime(); break;
      case 'done': cmp = Number(a.done) - Number(b.done); break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const Th = ({ label, col }: { label: string; col?: SortKey }) =>
    col ? (
      <th
        onClick={() => handleSort(col)}
        className="cursor-pointer select-none pb-3 pr-4 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-1">
          {label}
          <SortIndicator active={sortKey === col} dir={sortDir} />
        </span>
      </th>
    ) : (
      <th className="pb-3 pr-3 text-left text-xs font-medium text-muted-foreground">{label}</th>
    );

  if (tasks.length === 0) {
    return <p className="py-6 text-center text-sm text-subtle-foreground">{emptyLabel}</p>;
  }

  return (
    <table className="w-full">
      <thead>
        <tr>
          <Th label="" />
          <Th label="Tâche" col="title" />
          <Th label="Priorité" col="priority" />
          <Th label="Estimation" col="estimatedTime" />
          {!compact && <Th label="Créée le" col="createdAt" />}
          {!compact && <Th label="Statut" col="done" />}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {sorted.map((t) => (
          <tr key={t.id}>
            <td className="w-6 py-3 pr-3">
              <button
                onClick={() => onToggle(t.id)}
                className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded border transition-colors ${
                  t.done ? 'border-accent bg-accent' : 'border-input hover:border-accent/50'
                }`}
              >
                {t.done && <CheckIcon className="h-2.5 w-2.5 text-white" />}
              </button>
            </td>
            <td className="py-3 pr-4">
              <span className={`text-sm ${t.done ? 'text-subtle-foreground line-through' : 'text-foreground/80'}`}>
                {t.title}
              </span>
              {t.description && (
                <p className="mt-0.5 text-xs text-subtle-foreground/60">{t.description}</p>
              )}
            </td>
            <td className="py-3 pr-4">
              <span className={`rounded px-1.5 py-0.5 text-xs ${PRIORITY_STYLES[t.priority]}`}>
                {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
              </span>
            </td>
            <td className="py-3 pr-4">
              {t.estimatedTime ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={11} />
                  {t.estimatedTime}
                </span>
              ) : (
                <span className="text-xs text-subtle-foreground/40">—</span>
              )}
            </td>
            {!compact && (
              <td className="py-3 pr-4">
                <span className="text-xs text-subtle-foreground">{formatDate(t.createdAt)}</span>
              </td>
            )}
            {!compact && (
              <td className="py-3">
                <span className={`text-xs ${t.done ? 'text-green-400' : 'text-subtle-foreground'}`}>
                  {t.done ? 'Terminée' : 'En cours'}
                </span>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
