import { useState, useEffect } from 'react';

export type FocusPhase = 'idle' | 'focusing' | 'paused' | 'break' | 'done';

export function useFocusTimer(focusDuration: number, breakDuration: number) {
  const [phase, setPhase] = useState<FocusPhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(focusDuration * 60);

  // Sync display when config changes in idle
  useEffect(() => {
    if (phase === 'idle') setSecondsLeft(focusDuration * 60);
  }, [focusDuration, phase]);

  // Countdown — one timeout per tick to allow clean pause/resume
  useEffect(() => {
    if (phase !== 'focusing' && phase !== 'break') return;

    if (secondsLeft === 0) {
      if (phase === 'focusing') {
        setPhase('break');
        setSecondsLeft(breakDuration * 60);
      } else {
        setPhase('done');
      }
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft, breakDuration]);

  return {
    phase,
    secondsLeft,
    start:     () => { setPhase('focusing'); setSecondsLeft(focusDuration * 60); },
    pause:     () => setPhase('paused'),
    resume:    () => setPhase('focusing'),
    stop:      () => { setPhase('idle'); setSecondsLeft(focusDuration * 60); },
    complete:  () => setPhase('done'),
    skipBreak: () => setPhase('done'),
    restart:   () => { setPhase('idle'); setSecondsLeft(focusDuration * 60); },
  };
}
