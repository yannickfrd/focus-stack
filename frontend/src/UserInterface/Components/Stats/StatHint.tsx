export function StatHint({ text }: { text: string }) {
  return (
    <span className="group relative ml-1 inline-flex cursor-default">
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[9px] opacity-40 group-hover:opacity-80">?</span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-48 -translate-x-1/2 rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}
