import { LogoIcon } from '@ui/Components/Icons/LogoIcon';

export function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-accent/20" />
        <div className="absolute h-12 w-12 animate-ping rounded-full bg-accent/30 [animation-delay:150ms]" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/40">
          <LogoIcon className="h-5 w-5 text-accent" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-sm font-medium text-foreground">Focus Stack</span>
        <span className="text-xs text-subtle-foreground">Chargement en cours…</span>
      </div>
    </div>
  );
}
