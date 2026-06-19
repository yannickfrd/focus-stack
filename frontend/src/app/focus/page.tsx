import { Suspense } from 'react';
import type { Metadata } from 'next';
import { FocusScreen } from '@ui/Screens/Focus/FocusScreen';
import { LoadingScreen } from '@ui/Screens/Common/LoadingScreen';

export const metadata: Metadata = { title: 'Mode Focus — Focus Stack' };

export default function FocusPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <FocusScreen />
    </Suspense>
  );
}
