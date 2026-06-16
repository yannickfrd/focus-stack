import type { Metadata } from 'next';
import { DashboardScreen } from '@ui/Screens/Dashboard/DashboardScreen';

export const metadata: Metadata = { title: 'Tableau de bord — Focus Stack' };

export default function DashboardPage() {
  return <DashboardScreen />;
}
