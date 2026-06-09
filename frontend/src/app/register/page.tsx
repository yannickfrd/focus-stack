import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@ui/Components/User/RegisterForm';
import { LogoIcon } from '@ui/Components/Icons/LogoIcon';

export const metadata: Metadata = { title: 'Inscription — Focus Stack' };

export default function RegisterPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
          <LogoIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-foreground">Focus Stack</p>
          <p className="text-xs leading-tight text-subtle-foreground">Construisez votre focus.</p>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="mb-1 text-xl font-semibold text-foreground">Créer un compte</h1>
        <p className="mb-6 text-sm text-muted-foreground">Commencez à construire votre focus dès aujourd&apos;hui.</p>
        <RegisterForm />
        <p className="mt-5 text-center text-sm text-subtle-foreground">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-accent-dim transition-colors hover:text-accent-hover">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
