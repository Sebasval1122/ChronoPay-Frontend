import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Rol } from "../api/types";

interface NavItem {
  to: string;
  label: string;
  rolesPermitidos: Rol[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Inicio", rolesPermitidos: ["admin_general", "gerente_sucursal", "empleado"] },
  { to: "/asistencia", label: "Asistencia", rolesPermitidos: ["admin_general", "gerente_sucursal", "empleado"] },
  { to: "/nomina", label: "Nómina", rolesPermitidos: ["admin_general", "gerente_sucursal", "empleado"] },
  { to: "/usuarios", label: "Usuarios", rolesPermitidos: ["admin_general", "gerente_sucursal"] },
  { to: "/sucursales", label: "Sucursales", rolesPermitidos: ["admin_general"] },
];

const ETIQUETA_ROL: Record<Rol, string> = {
  admin_general: "Admin general",
  gerente_sucursal: "Gerente de sucursal",
  empleado: "Empleado",
};

export function Layout() {
  const { usuario, logout } = useAuth();

  if (!usuario) return null;

  const items = NAV_ITEMS.filter((item) => item.rolesPermitidos.includes(usuario.rol));

  return (
    <div className="flex h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-white">
        <div className="border-b border-line px-6 py-5">
          <p className="text-lg font-semibold tracking-tight text-primary-dark">ChronoPay</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-light text-primary-dark"
                    : "text-ink/70 hover:bg-surface hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line px-4 py-4">
          <p className="truncate text-sm font-medium">
            {usuario.first_name || usuario.username} {usuario.last_name}
          </p>
          <p className="text-xs text-ink/50">{ETIQUETA_ROL[usuario.rol]}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-md border border-line px-3 py-1.5 text-sm text-ink/70 hover:bg-surface"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
