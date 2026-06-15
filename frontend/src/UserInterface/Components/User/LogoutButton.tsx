'use client';

import { LogOut } from 'lucide-react';
import { useLogoutUser } from '@ui/Hooks/User/useLogoutUser';

export function LogoutButton() {
  const { logout, isLoading } = useLogoutUser();

  return (
    <button
      onClick={logout}
      disabled={isLoading}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogOut size={15} />
      {isLoading ? 'Déconnexion…' : 'Se déconnecter'}
    </button>
  );
}
