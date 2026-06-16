'use client';

const HOURS   = Array.from({ length: 9 }, (_, i) => i);      // 0–8h
const MINUTES = [0, 15, 30, 45];

function parse(value?: string): { h: number; m: number } {
  if (!value) return { h: 0, m: 0 };
  const hMatch = value.match(/(\d+)h/);
  const mMatch = value.match(/(\d+)min/);
  const h = hMatch ? parseInt(hMatch[1]) : 0;
  const rawM = mMatch ? parseInt(mMatch[1]) : 0;
  const m = MINUTES.includes(rawM) ? rawM : MINUTES.reduce((prev, cur) =>
    Math.abs(cur - rawM) < Math.abs(prev - rawM) ? cur : prev, 0);
  return { h, m };
}

export function formatEstimate(h: number, m: number): string | undefined {
  if (h === 0 && m === 0) return undefined;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

interface Props {
  value?: string;
  onChange: (value: string | undefined) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  size?: 'sm' | 'md';
}

export function TimeEstimatePicker({ value, onChange, onBlur, autoFocus, size = 'sm' }: Props) {
  const { h, m } = parse(value);

  const selectClass = size === 'sm'
    ? 'rounded bg-background px-1 py-0.5 text-[10px] text-foreground outline-none ring-1 ring-accent/50 cursor-pointer'
    : 'rounded-lg border border-input bg-elevated px-2 py-2 text-xs text-foreground focus:outline-none cursor-pointer';

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) onBlur?.();
  };

  return (
    <div className="flex items-center gap-1" onBlur={handleBlur}>
      <select
        autoFocus={autoFocus}
        value={h}
        onChange={(e) => onChange(formatEstimate(Number(e.target.value), m))}
        className={selectClass}
      >
        {HOURS.map((n) => (
          <option key={n} value={n}>{n}h</option>
        ))}
      </select>
      <select
        value={m}
        onChange={(e) => onChange(formatEstimate(h, Number(e.target.value)))}
        className={selectClass}
      >
        {MINUTES.map((n) => (
          <option key={n} value={n}>{n}min</option>
        ))}
      </select>
    </div>
  );
}
