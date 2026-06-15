import type { Metadata } from 'next';
import { TasksPageClient } from '@ui/Components/Task/TasksPageClient';

export const metadata: Metadata = { title: 'Liste des tâches — Focus Stack' };

export default function TasksPage() {
  return <TasksPageClient />;
}
