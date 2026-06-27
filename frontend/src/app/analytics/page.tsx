import type { Metadata } from 'next';
import { AnalyticsScreen } from '@ui/Screens/Analytics/AnalyticsScreen';

export const metadata: Metadata = { title: 'Analytique — Focus Stack' };

export default function AnalyticsPage() {
  return <AnalyticsScreen />;
}
