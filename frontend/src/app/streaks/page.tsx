import type { Metadata } from 'next';
import { StreaksScreen } from '@ui/Screens/Streaks/StreaksScreen';

export const metadata: Metadata = { title: 'Séries — Focus Stack' };

export default function StreaksPage() {
  return <StreaksScreen />;
}
