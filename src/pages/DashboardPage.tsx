import { useEffect, useState, type FormEvent } from "react";
import { api, getListData } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Budget, DashboardBranch } from "../api/types";

function formatearMoneda(valor: string | number) {
  return Number(valor).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function numero(valor: string | number | null) {
  return valor === null ? null : Number(valor);
}

export function DashboardPage() {
  const { user } = useAuth();
  const ahora = new Date();
  const [periodo, setPeriodo] = useState(
    `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`,
  );
  const [branches, setBranches] = useState<DashboardBranch[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [presupuestoEditado, setPresupuestoEditado] = useState<number | null>(null);
  const [valorPresupuesto, setValorPresupuesto] = useState("");
  const [guardando, setGuardando] = useState<number | null>(null);

  const [year, month] = periodo.split("-").map(Number);
  const puedeEditar = user?.rol === "admin_general" || user?.rol === "gerente_sucursal";

  async function cargarDashboard() {
    setCargando(true);
    setMensaje(null);
    try {
      const [dashboardResponse, budgetsResponse] = await Promise.all([
        api.get<DashboardBranch[]>("/api/dashboard/branches/", { params: { year, month } }),
        api.get<Budget[] | { results: Budget[] }>("/api/budgets/"),
      ]);
      setBranches(getListData(dashboardResponse.data));
      setBudgets(getListData(budgetsResponse.data));
    } catch {
      setMensaje("Dashboard data could not be loaded.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDashboard();
  }, [periodo]);

  function presupuestoDe(branchId: number) {
    return budgets.find(
      (budget) => budget.branch === branchId && budget.year === year && budget.month === month,
    );
  }

  function puedeEditarSucursal(branchId: number) {
    return user?.rol === "admin_general" || user?.sucursal === branchId;
  }

  function iniciarEdicion(branch: DashboardBranch) {
    setPresupuestoEditado(branch.branch_id);
    setValorPresupuesto(branch.budgeted_amount === null ? "" : String(branch.budgeted_amount));
    setMensaje(null);
  }

  async function guardarPresupuesto(event: FormEvent, branchId: number) {
    event.preventDefault();
    const amount = Number(valorPresupuesto);
    if (!Number.isFinite(amount) || amount < 0) {
      setMensaje("Enter a valid budget amount.");
      return;
    }

    setGuardando(branchId);
    setMensaje(null);
    try {
      const existingBudget = presupuestoDe(branchId);
      const payload = { branch: branchId, year, month, budgeted_amount: amount };
      if (existingBudget) {
        await api.patch(`/api/budgets/${existingBudget.id}/`, payload);
      } else {
        await api.post("/api/budgets/", payload);
      }
      setPresupuestoEditado(null);
      await cargarDashboard();
    } catch {
      setMensaje("The budget could not be saved.");
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-ink/60">Branch payroll and attendance overview.</p>
        </div>
        <label className="text-sm font-medium">
          Period
          <input
            type="month"
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value)}
            className="ml-3 rounded-md border border-line bg-white px-3 py-2 font-normal"
          />
        </label>
      </div>

      {mensaje && <p className="mt-3 text-sm text-alert">{mensaje}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-line bg-surface text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Branch</th>
              <th className="px-4 py-3 font-medium">Active employees</th>
              <th className="px-4 py-3 font-medium">Real payroll</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Difference</th>
              <th className="px-4 py-3 font-medium">Overtime hours</th>
              <th className="px-4 py-3 font-medium">Novedades</th>
              <th className="px-4 py-3 font-medium">Attendance records</th>
              {puedeEditar && <th className="px-4 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={puedeEditar ? 9 : 8}>Loading…</td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={puedeEditar ? 9 : 8}>No dashboard data for this period.</td>
              </tr>
            ) : (
              branches.map((branch) => {
                const difference = numero(branch.budget_difference);
                const editing = presupuestoEditado === branch.branch_id;
                const canEditBranch = puedeEditarSucursal(branch.branch_id);
                return (
                  <tr key={branch.branch_id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{branch.branch_name}</td>
                    <td className="px-4 py-3">{branch.active_employee_count}</td>
                    <td className="px-4 py-3">{formatearMoneda(branch.real_payroll_total)}</td>
                    <td className="px-4 py-3">
                      {branch.budgeted_amount === null ? "Sin presupuesto asignado" : formatearMoneda(branch.budgeted_amount)}
                    </td>
                    <td className={`px-4 py-3 font-medium ${difference === null ? "text-ink/50" : difference >= 0 ? "text-emerald-700" : "text-alert"}`}>
                      {difference === null ? "—" : formatearMoneda(difference)}
                    </td>
                    <td className="px-4 py-3">{branch.total_overtime_hours}</td>
                    <td className="px-4 py-3">{branch.work_events_count}</td>
                    <td className="px-4 py-3">{branch.attendance_records_count}</td>
                    {puedeEditar && (
                      <td className="px-4 py-3">
                        {canEditBranch && (editing ? (
                          <form onSubmit={(event) => guardarPresupuesto(event, branch.branch_id)} className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={valorPresupuesto}
                              onChange={(event) => setValorPresupuesto(event.target.value)}
                              aria-label={`Budget for ${branch.branch_name}`}
                              className="w-28 rounded-md border border-line px-2 py-1.5"
                              required
                            />
                            <button type="submit" disabled={guardando === branch.branch_id} className="rounded-md bg-primary px-3 py-1.5 text-white hover:bg-primary-dark disabled:opacity-50">
                              {guardando === branch.branch_id ? "Saving…" : "Save"}
                            </button>
                            <button type="button" onClick={() => setPresupuestoEditado(null)} className="text-ink/60 hover:text-ink">Cancel</button>
                          </form>
                        ) : (
                          <button type="button" onClick={() => iniciarEdicion(branch)} className="text-primary hover:underline">
                            Edit budget
                          </button>
                        ))}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}