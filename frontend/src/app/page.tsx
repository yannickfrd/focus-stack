import type { Metadata } from 'next';
import { DashboardClient } from '@ui/Components/Dashboard/DashboardClient';

export const metadata: Metadata = { title: 'Tableau de bord — Focus Stack' };

export default function DashboardPage() {
  return <DashboardClient />;
}
