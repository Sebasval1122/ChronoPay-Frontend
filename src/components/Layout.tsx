import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../api/types";

interface NavItem {
  to: string;
  label: string;
  allowedRoles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", allowedRoles: ["admin_general", "gerente_sucursal", "empleado"] },
  { to: "/asistencia", label: "Attendance", allowedRoles: ["admin_general", "gerente_sucursal", "empleado"] },
  { to: "/nomina", label: "Payroll", allowedRoles: ["admin_general", "gerente_sucursal", "empleado"] },
  { to: "/dashboard", label: "Dashboard", allowedRoles: ["admin_general", "gerente_sucursal"] },
  { to: "/usuarios", label: "Users", allowedRoles: ["admin_general", "gerente_sucursal"] },
  { to: "/sucursales", label: "Branches", allowedRoles: ["admin_general"] },
];

const ROLE_LABEL: Record<Role, string> = {
  admin_general: "General admin",
  gerente_sucursal: "Branch manager",
  empleado: "Employee",
};

export function Layout() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => item.allowedRoles.includes(user.rol));

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
            {user.first_name || user.username} {user.last_name}
          </p>
          <p className="text-xs text-ink/50">{ROLE_LABEL[user.rol]}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-md border border-line px-3 py-1.5 text-sm text-ink/70 hover:bg-surface"
          >
            Log out
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
