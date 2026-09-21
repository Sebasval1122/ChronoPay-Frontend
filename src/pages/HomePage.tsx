import { useAuth } from "../auth/AuthContext";

const ROLE_GREETING: Record<string, string> = {
  admin_general: "You have visibility across all branches.",
  gerente_sucursal: "You can manage attendance and payroll for your branch here.",
  employee: "Check in and review your payroll here.",
};

export function HomePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Hello, {user.first_name || user.username}
      </h1>
      <p className="mt-2 text-ink/60">{ROLE_GREETING[user.rol]}</p>
    </div>
  );
}
