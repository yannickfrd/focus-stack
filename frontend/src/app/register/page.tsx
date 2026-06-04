import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@ui/Components/User/RegisterForm';

export const metadata: Metadata = { title: 'Register — Focus Stack' };

export default function RegisterPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-foreground">Focus Stack</p>
          <p className="text-xs leading-tight text-subtle-foreground">Stack your progress.</p>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="mb-1 text-xl font-semibold text-foreground">Create an account</h1>
        <p className="mb-6 text-sm text-muted-foreground">Start building your focus today.</p>
        <RegisterForm />
        <p className="mt-5 text-center text-sm text-subtle-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-dim transition-colors hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
