import type { Metadata } from 'next';
import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { CheckIcon } from '@ui/Components/Icons/CheckIcon';

export const metadata: Metadata = { title: 'Tableau de bord — Focus Stack' };

const stats = [
  {
    label: "Focus aujourd'hui",
    value: '2h 45m',
    delta: '+12 min vs hier',
    accent: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
  },
  {
    label: 'Série en cours',
    value: '7 jours',
    delta: 'Record personnel : 14 jours',
    accent: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  },
  {
    label: 'Tâches accomplies',
    value: '12 / 15',
    delta: "3 restantes aujourd'hui",
    accent: 'border-green-500/20 bg-green-500/10 text-green-400',
  },
];

const todaysTasks = [
  { id: 1, title: 'Terminer la documentation API', done: true, priority: 'haute' },
  { id: 2, title: "Concevoir la page d'accueil", done: true, priority: 'moyenne' },
  { id: 3, title: 'Revoir les pull requests', done: false, priority: 'haute' },
  { id: 4, title: 'Notes de standup équipe', done: false, priority: 'basse' },
  { id: 5, title: 'Déployer en staging', done: false, priority: 'moyenne' },
];

const dailyItems = [
  { id: 1, title: 'Routine matinale', dot: 'bg-green-500' },
  { id: 2, title: 'Session de travail profond', dot: 'bg-accent' },
  { id: 3, title: 'Revue des emails', dot: 'bg-yellow-500' },
  { id: 4, title: 'Exercice', dot: 'bg-blue-500' },
  { id: 5, title: 'Lecture', dot: 'bg-orange-500' },
];

const tasks = [
  { title: 'Terminer la documentation API', project: 'Backend', due: "Aujourd'hui", priority: 'Haute', done: true },
  { title: 'Mise à jour du design system', project: 'Frontend', due: 'Demain', priority: 'Moyenne', done: false },
  { title: 'Revoir les pull requests', project: 'Backend', due: "Aujourd'hui", priority: 'Haute', done: false },
  { title: 'Notes de standup équipe', project: 'Général', due: "Aujourd'hui", priority: 'Basse', done: true },
  { title: 'Déployer en staging', project: 'DevOps', due: 'Ven', priority: 'Moyenne', done: false },
];

const priorityClass: Record<string, string> = {
  Haute: 'bg-red-500/10 text-red-400',
  Moyenne: 'bg-yellow-500/10 text-yellow-400',
  Basse: 'bg-green-500/10 text-green-400',
  haute: 'bg-red-500/10 text-red-400',
  moyenne: 'bg-yellow-500/10 text-yellow-400',
  basse: 'bg-green-500/10 text-green-400',
};

const weekBars = [3, 5, 4, 7, 6, 8, 5];
const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Tableau de bord</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Bon retour, <span className="font-medium text-foreground">Alexandra</span> 👋
            </p>
          </div>
          <p className="text-sm text-subtle-foreground">Aujourd&apos;hui, 28 mai 2025</p>
        </div>

        <div className="space-y-5 px-8 pb-8">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-xl border p-5 ${s.accent.split(' ').slice(0, 2).join(' ')}`}>
                <p className="text-xs uppercase tracking-wide text-subtle-foreground">{s.label}</p>
                <p className={`mt-1 text-2xl font-bold ${s.accent.split(' ')[2]}`}>{s.value}</p>
                <p className="mt-1 text-xs text-subtle-foreground">{s.delta}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Tâches du jour</h2>
              <ul className="space-y-2.5">
                {todaysTasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-3">
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      t.done ? 'border-accent bg-accent' : 'border-input'
                    }`}>
                      {t.done && <CheckIcon className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <span className={`flex-1 text-sm ${t.done ? 'text-subtle-foreground line-through' : 'text-foreground/70'}`}>
                      {t.title}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-xs ${priorityClass[t.priority]}`}>
                      {t.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Liste quotidienne</h2>
                <span className="text-xs text-subtle-foreground">Groupe 1</span>
              </div>
              <ul className="space-y-3">
                {dailyItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`} />
                    <span className="text-sm text-foreground/70">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Tâches</h2>
                <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover">
                  + Priorité
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    {['Tâche', 'Projet', 'Échéance', 'Priorité'].map((h) => (
                      <th key={h} className="pb-2 text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tasks.map((t, i) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-4">
                        <span className={`text-sm ${t.done ? 'text-subtle-foreground line-through' : 'text-foreground/70'}`}>
                          {t.title}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">{t.project}</td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">{t.due}</td>
                      <td className="py-2.5">
                        <span className={`rounded px-1.5 py-0.5 text-xs ${priorityClass[t.priority]}`}>
                          {t.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground">Analytique</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-xl font-bold text-foreground">23</p>
                  <p className="text-xs text-muted-foreground">Tâches cette semaine</p>
                </div>
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-lg font-bold text-foreground">12h 45m</p>
                  <p className="text-xs text-muted-foreground">Temps de focus</p>
                </div>
              </div>
              <div className="flex flex-1 items-end gap-1">
                {weekBars.map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-sm bg-accent/70" style={{ height: `${(h / 8) * 72}px` }} />
                    <span className="text-[9px] text-subtle-foreground">{days[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
