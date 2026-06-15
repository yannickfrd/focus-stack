'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, List, Timer, BarChart2, Flame, Moon } from 'lucide-react';
import { LogoIcon } from '@ui/Components/Icons/LogoIcon';
import { LogoutButton } from '@ui/Components/User/LogoutButton';

const NAV = [
  { label: 'Tableau de bord', href: '/', Icon: LayoutDashboard },
  { label: 'Liste des tâches', href: '/tasks', Icon: CheckSquare },
  { label: 'Liste quotidienne', href: '/daily', Icon: List },
  { label: 'Mode Focus', href: '/focus', Icon: Timer },
  { label: 'Analytique', href: '/analytics', Icon: BarChart2 },
  { label: 'Séries', href: '/streaks', Icon: Flame },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-52 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <LogoIcon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">Focus Stack</p>
          <p className="text-[10px] leading-tight text-subtle-foreground">Construisez votre focus.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {NAV.map(({ label, href, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-accent/20 font-medium text-accent-dim'
                  : 'text-muted-foreground hover:bg-elevated hover:text-foreground'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-4">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground">
          <Moon size={15} />
          Mode sombre
        </button>
        <LogoutButton />
        <div className="mt-3 flex items-center gap-1.5 px-3">
          <span className="text-[10px] text-subtle-foreground">Symfony</span>
          <span className="text-[10px] text-border">·</span>
          <span className="text-[10px] text-subtle-foreground">React</span>
          <span className="text-[10px] text-border">·</span>
          <span className="text-[10px] text-subtle-foreground">PostgreSQL</span>
        </div>
      </div>
    </aside>
  );
}
