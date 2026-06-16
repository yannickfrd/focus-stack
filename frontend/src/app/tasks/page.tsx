import type { Metadata } from 'next';
import { TasksScreen } from '@ui/Screens/Task/TasksScreen';

export const metadata: Metadata = { title: 'Liste des tâches — Focus Stack' };

export default function TasksPage() {
  return <TasksScreen />;
}
