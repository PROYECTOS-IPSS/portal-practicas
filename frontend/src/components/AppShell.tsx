import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from './ui/Button';

const NAV_ITEMS = [
  { to: '/', label: 'Prácticas' },
  { to: '/internships/new', label: 'Nueva práctica' },
];

function NavLinks() {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-field px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-brand-soft text-brand-strong' : 'text-muted hover:bg-paper hover:text-ink'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <p className="font-display text-lg font-semibold">Prácticas TP</p>
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Seguimiento</p>
        </div>
        <nav className="space-y-1">
          <NavLinks />
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-3">
          <p className="font-display text-base font-semibold lg:hidden">Prácticas TP</p>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-sm font-medium text-ink">{user.name}</span>
            <span className="font-mono text-xs text-muted">{user.email}</span>
            <span className="rounded-chip bg-brand-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-brand-strong">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted lg:hidden">{user.email}</span>
            <Button variant="ghost" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-surface px-4 py-2 lg:hidden">
          <NavLinks />
        </nav>

        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
