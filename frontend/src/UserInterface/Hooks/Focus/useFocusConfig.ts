import { useState } from 'react';

export type FocusConfig = {
  focusDuration: number;
  breakDuration: number;
};

const DEFAULT: FocusConfig = { focusDuration: 25, breakDuration: 5 };
const STORAGE_KEY = 'focus-stack:focus-config';

export function useFocusConfig() {
  const [config, setConfig] = useState<FocusConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT, ...JSON.parse(stored) } : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  const update = (changes: Partial<FocusConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...changes };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { config, update };
}
