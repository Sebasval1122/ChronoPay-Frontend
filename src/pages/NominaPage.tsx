import { useEffect, useState, type FormEvent } from "react";
import { api, getListData } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Nomina } from "../api/types";

function formatearMoneda(valor: string) {
  return Number(valor).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export function NominaPage() {
  const { usuario } = useAuth();
  const [nominas, setNominas] = useState<Nomina[]>([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({ sucursal: "", periodo_inicio: "", periodo_fin: "" });
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const puedeGestionar = usuario?.rol === "admin_general" || usuario?.rol === "gerente_sucursal";

  async function cargarNominas() {
    setCargando(true);
    try {
      const { data } = await api.get<Nomina[] | { results: Nomina[] }>("/api/nomina/");
      setNominas(getListData(data));
    } catch {
      setMensaje("No se pudieron cargar las nóminas.");
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

    const sucursal = usuario?.rol === "gerente_sucursal" ? usuario.sucursal : Number(form.sucursal);
    if (!sucursal) {
      setMensaje("Debes indicar una sucursal válida.");
      return;
    }

    setGuardando(true);
    try {
      await api.post("/api/nomina/", {
        sucursal,
        periodo_inicio: form.periodo_inicio,
        periodo_fin: form.periodo_fin,
      });
      setForm({ sucursal: "", periodo_inicio: "", periodo_fin: "" });
      await cargarNominas();
    } catch {
      setMensaje("No se pudo crear el período de nómina.");
    } finally {
      setGuardando(false);
    }
  }

  async function generarNomina(nominaId: number) {
    setGenerando(nominaId);
    setMensaje(null);
    try {
      await api.post(`/api/nomina/${nominaId}/generar/`);
      await cargarNominas();
    } catch {
      setMensaje("No se pudo generar la nómina.");
    } finally {
      setGenerando(null);
    }
  }

  function abrirComprobante(detalleId: number) {
    window.open(
      `${import.meta.env.VITE_API_URL}/api/comprobantes/${detalleId}/pdf/`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Nómina</h1>
      <p className="mt-2 text-sm text-ink/60">
        {usuario?.rol === "empleado" ? "Consulta tus periodos de nómina." : "Periodos de nómina registrados."}
      </p>

      {puedeGestionar && (
        <form
          onSubmit={crearNomina}
          className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-line bg-white p-6 sm:grid-cols-4"
        >
          {usuario?.rol === "admin_general" ? (
            <input
              type="number"
              min="1"
              placeholder="ID sucursal"
              value={form.sucursal}
              onChange={(event) => setForm({ ...form, sucursal: event.target.value })}
              required
              className="rounded-md border border-line px-3 py-2 text-sm"
            />
          ) : (
            <input
              value={`Sucursal ${usuario?.sucursal ?? "no asignada"}`}
              readOnly
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm"
            />
          )}
          <input
            type="date"
            value={form.periodo_inicio}
            onChange={(event) => setForm({ ...form, periodo_inicio: event.target.value })}
            required
            className="rounded-md border border-line px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.periodo_fin}
            onChange={(event) => setForm({ ...form, periodo_fin: event.target.value })}
            required
            className="rounded-md border border-line px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {guardando ? "Creando…" : "Crear período"}
          </button>
        </form>
      )}

      {mensaje && <p className="mt-3 text-sm text-alert">{mensaje}</p>}

      {cargando ? (
        <div className="mt-6 rounded-lg border border-line bg-white px-4 py-4 text-sm text-ink/50">
          Cargando...
        </div>
      ) : nominas.length === 0 ? (
        <div className="mt-6 rounded-lg border border-line bg-white px-4 py-4 text-sm text-ink/50">
          No hay nóminas disponibles.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {nominas.map((nomina) => (
            <section key={nomina.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
                <div>
                  <h2 className="font-medium">{nomina.periodo_inicio} - {nomina.periodo_fin}</h2>
                  <p className="text-sm text-ink/60">
                    Estado: {nomina.estado} · Total: {formatearMoneda(nomina.total)}
                  </p>
                </div>
                {puedeGestionar && (
                  <button
                    type="button"
                    onClick={() => generarNomina(nomina.id)}
                    disabled={generando === nomina.id}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    {generando === nomina.id ? "Generando…" : "Generar / recalcular"}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line text-ink/60">
                    <tr>
                      {puedeGestionar && <th className="px-4 py-3 font-medium">Empleado</th>}
                      <th className="px-4 py-3 font-medium">Horas extra</th>
                      <th className="px-4 py-3 font-medium">Recargos</th>
                      <th className="px-4 py-3 font-medium">Retención</th>
                      <th className="px-4 py-3 font-medium">Total neto</th>
                      <th className="px-4 py-3 font-medium">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nomina.detalles.map((detalle) => (
                      <tr key={detalle.id} className="border-b border-line last:border-0">
                        {puedeGestionar && <td className="px-4 py-3">{detalle.usuario_nombre}</td>}
                        <td className="px-4 py-3">{detalle.horas_extra}</td>
                        <td className="px-4 py-3">{formatearMoneda(detalle.recargos)}</td>
                        <td className="px-4 py-3">{formatearMoneda(detalle.retencion_fuente)}</td>
                        <td className="px-4 py-3 font-semibold">{formatearMoneda(detalle.total_neto)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => abrirComprobante(detalle.id)}
                            className="text-primary hover:underline"
                          >
                            Comprobante PDF
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