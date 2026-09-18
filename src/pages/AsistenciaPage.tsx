import { useEffect, useState } from "react";
import { api, getListData } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Marcaje } from "../api/types";

function formatearHora(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function AsistenciaPage() {
  const { usuario } = useAuth();
  const [marcajes, setMarcajes] = useState<Marcaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [accionEnCurso, setAccionEnCurso] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargarMarcajes() {
    setCargando(true);
    try {
      const { data } = await api.get<Marcaje[] | { results: Marcaje[] }>("/api/asistencia/marcajes/");
      setMarcajes(getListData(data));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarMarcajes();
  }, []);

  const marcajeAbiertoHoy = marcajes.find(
    (m) => m.empleado === usuario?.id && !m.salida
  );

  async function marcarEntrada() {
    setAccionEnCurso(true);
    setMensaje(null);
    try {
      await api.post("/api/asistencia/marcajes/marcar-entrada/");
      setMensaje("Entrada registrada.");
      await cargarMarcajes();
    } catch (err: any) {
      setMensaje(err?.response?.data?.detail ?? "No se pudo registrar la entrada.");
    } finally {
      setAccionEnCurso(false);
    }
  }

  async function marcarSalida() {
    if (!marcajeAbiertoHoy) return;
    setAccionEnCurso(true);
    setMensaje(null);
    try {
      await api.post(`/api/asistencia/marcajes/${marcajeAbiertoHoy.id}/marcar-salida/`);
      setMensaje("Salida registrada.");
      await cargarMarcajes();
    } catch (err: any) {
      setMensaje(err?.response?.data?.detail ?? "No se pudo registrar la salida.");
    } finally {
      setAccionEnCurso(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Asistencia</h1>

      {usuario?.rol === "empleado" && (
        <div className="mt-6 rounded-lg border border-line bg-white p-6">
          <p className="text-sm text-ink/60">
            {marcajeAbiertoHoy
              ? `Entrada de hoy: ${formatearHora(marcajeAbiertoHoy.entrada)}`
              : "Aún no has marcado entrada hoy."}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={marcarEntrada}
              disabled={accionEnCurso || !!marcajeAbiertoHoy}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              Marcar entrada
            </button>
            <button
              onClick={marcarSalida}
              disabled={accionEnCurso || !marcajeAbiertoHoy}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-surface disabled:opacity-50"
            >
              Marcar salida
            </button>
          </div>
          {mensaje && <p className="mt-3 text-sm text-ink/70">{mensaje}</p>}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-ink/60">
            <tr>
              {usuario?.rol !== "empleado" && <th className="px-4 py-3 font-medium">Empleado</th>}
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Entrada</th>
              <th className="px-4 py-3 font-medium">Salida</th>
              <th className="px-4 py-3 font-medium">Horas</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={5}>
                  Cargando…
                </td>
              </tr>
            ) : marcajes.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={5}>
                  Todavía no hay marcajes registrados.
                </td>
              </tr>
            ) : (
              marcajes.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  {usuario?.rol !== "empleado" && (
                    <td className="px-4 py-3">{m.empleado_nombre ?? m.empleado}</td>
                  )}
                  <td className="px-4 py-3">{m.fecha}</td>
                  <td className="px-4 py-3">{formatearHora(m.entrada)}</td>
                  <td className="px-4 py-3">{formatearHora(m.salida)}</td>
                  <td className="px-4 py-3">{m.horas_trabajadas ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
