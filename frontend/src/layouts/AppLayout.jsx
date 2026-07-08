import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/operadores', label: 'Operadores' },
  { to: '/empresas', label: 'Empresas' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/certificaciones', label: 'Certificaciones' },
];

function AppLayout() {
  const { adminProfile, logout } = useAuth();

  return (
    <div className="flex h-screen bg-surface">
      <aside className="w-60 shrink-0 bg-primary text-white flex flex-col">
        <div className="px-6 py-5 text-lg font-semibold border-b border-white/10">TECPORT · Operadores</div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent text-white' : 'text-white/80 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between bg-white border-b px-6 py-3 shadow-sm">
          <div className="text-sm text-neutral">Panel administrativo</div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-primary">{adminProfile?.nombre}</span>
            <button onClick={logout} className="text-sm font-medium text-accent hover:underline">
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
