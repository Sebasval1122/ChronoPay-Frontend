import { useEffect, useState, type FormEvent } from "react";
import { api, getListData } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Payroll } from "../api/types";

function formatearMoneda(valor: string) {
  return Number(valor).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export function PayrollPage() {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({ branch: "", period_start: "", period_end: "" });
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const canManage = user?.rol === "admin_general" || user?.rol === "gerente_sucursal";

  async function cargarNominas() {
    setCargando(true);
    try {
      const { data } = await api.get<Payroll[] | { results: Payroll[] }>("/api/payroll/");
      setPayrolls(getListData(data));
    } catch {
      setMensaje("Payroll could not be loaded.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarNominas();
  }, []);

  async function crearNomina(event: FormEvent) {
    event.preventDefault();
    setMensaje(null);

    const branch = user?.rol === "gerente_sucursal" ? user.branch : Number(form.branch);
    if (!branch) {
      setMensaje("You must provide a valid branch.");
      return;
    }

    setGuardando(true);
    try {
      await api.post("/api/payroll/", {
        branch,
        period_start: form.period_start,
        period_end: form.period_end,
      });
      setForm({ branch: "", period_start: "", period_end: "" });
      await cargarNominas();
    } catch {
      setMensaje("The payroll period could not be created.");
    } finally {
      setGuardando(false);
    }
  }

  async function generarNomina(nominaId: number) {
    setGenerando(nominaId);
    setMensaje(null);
    try {
      await api.post(`/api/payroll/${nominaId}/generar/`);
      await cargarNominas();
    } catch {
      setMensaje("Payroll could not be generated.");
    } finally {
      setGenerando(null);
    }
  }

  function abrirComprobante(detalleId: number) {
    window.open(
      `${import.meta.env.VITE_API_URL}/api/pay_slips/${detalleId}/pdf/`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
      <p className="mt-2 text-sm text-ink/60">
        {user?.rol === "employee" ? "Review your payroll periods." : "Recorded payroll periods."}
      </p>

      {canManage && (
        <form
          onSubmit={crearNomina}
          className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-line bg-white p-6 sm:grid-cols-4"
        >
          {user?.rol === "admin_general" ? (
            <input
              type="number"
              min="1"
              placeholder="Branch ID"
              value={form.branch}
              onChange={(event) => setForm({ ...form, branch: event.target.value })}
              required
              className="rounded-md border border-line px-3 py-2 text-sm"
            />
          ) : (
            <input
              value={`Branch ${user?.branch ?? "not assigned"}`}
              readOnly
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm"
            />
          )}
          <input
            type="date"
            value={form.period_start}
            onChange={(event) => setForm({ ...form, period_start: event.target.value })}
            required
            className="rounded-md border border-line px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.period_end}
            onChange={(event) => setForm({ ...form, period_end: event.target.value })}
            required
            className="rounded-md border border-line px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {guardando ? "Creating…" : "Create period"}
          </button>
        </form>
      )}

      {mensaje && <p className="mt-3 text-sm text-alert">{mensaje}</p>}

      {cargando ? (
        <div className="mt-6 rounded-lg border border-line bg-white px-4 py-4 text-sm text-ink/50">
          Cargando...
        </div>
      ) : payrolls.length === 0 ? (
        <div className="mt-6 rounded-lg border border-line bg-white px-4 py-4 text-sm text-ink/50">
          No payroll available.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {payrolls.map((payroll) => (
            <section key={payroll.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
                <div>
                  <h2 className="font-medium">{payroll.period_start} - {payroll.period_end}</h2>
                  <p className="text-sm text-ink/60">
                    Status: {payroll.status} · Total: {formatearMoneda(payroll.total)}
                  </p>
                </div>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => generarNomina(payroll.id)}
                    disabled={generando === payroll.id}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    {generando === payroll.id ? "Generating…" : "Generate / recalculate"}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line text-ink/60">
                    <tr>
                      {canManage && <th className="px-4 py-3 font-medium">Employee</th>}
                      <th className="px-4 py-3 font-medium">Overtime</th>
                      <th className="px-4 py-3 font-medium">Surcharges</th>
                      <th className="px-4 py-3 font-medium">Withholding</th>
                      <th className="px-4 py-3 font-medium">Net total</th>
                      <th className="px-4 py-3 font-medium">Payslip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payroll.detalles.map((detalle) => (
                      <tr key={detalle.id} className="border-b border-line last:border-0">
                        {canManage && <td className="px-4 py-3">{detalle.user_name}</td>}
                          <td className="px-4 py-3">{detalle.overtime_hours}</td>
                          <td className="px-4 py-3">{formatearMoneda(detalle.surcharges)}</td>
                          <td className="px-4 py-3">{formatearMoneda(detalle.withholding)}</td>
                          <td className="px-4 py-3 font-semibold">{formatearMoneda(detalle.net_total)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => abrirComprobante(detalle.id)}
                            className="text-primary hover:underline"
                          >
                            PDF payslip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}