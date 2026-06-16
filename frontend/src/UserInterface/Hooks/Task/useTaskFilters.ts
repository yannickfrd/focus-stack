import { useState } from 'react';
import type { Task } from '@domain/Entities/Task/Task';

export type StatusFilter = 'all' | 'pending' | 'done';

export const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En cours' },
  { key: 'done', label: 'Terminées' },
];

export function useTaskFilters() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const applyFilters = (list: Task[]) =>
    list
      .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => statusFilter === 'all' || (statusFilter === 'done' ? t.done : !t.done));

  return { search, setSearch, statusFilter, setStatusFilter, applyFilters };
}
