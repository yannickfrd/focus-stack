import type { Metadata } from 'next';
import { RoutineScreen } from '@ui/Screens/Routine/RoutineScreen';

export const metadata: Metadata = { title: 'Liste quotidienne — Focus Stack' };

export default function DailyPage() {
  return <RoutineScreen />;
}
