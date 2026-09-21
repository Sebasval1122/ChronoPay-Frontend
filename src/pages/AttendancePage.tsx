import { useEffect, useState } from "react";
import { api, getListData } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { AttendanceRecord } from "../api/types";

function formatearHora(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [cargando, setCargando] = useState(true);
  const [accionEnCurso, setAccionEnCurso] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargarMarcajes() {
    setCargando(true);
    try {
      const { data } = await api.get<AttendanceRecord[] | { results: AttendanceRecord[] }>("/api/attendance/marcajes/");
      setRecords(getListData(data));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarMarcajes();
  }, []);

  const openRecordToday = records.find(
    (record) => record.employee === user?.id && !record.clock_out_time
  );

  async function marcarEntrada() {
    setAccionEnCurso(true);
    setMensaje(null);
    try {
      await api.post("/api/attendance/marcajes/clock-in/");
      setMensaje("Check-in recorded.");
      await cargarMarcajes();
    } catch (err: any) {
      setMensaje(err?.response?.data?.detail ?? "Check-in could not be recorded.");
    } finally {
      setAccionEnCurso(false);
    }
  }

  async function marcarSalida() {
    if (!openRecordToday) return;
    setAccionEnCurso(true);
    setMensaje(null);
    try {
      await api.post(`/api/attendance/marcajes/${openRecordToday.id}/clock-out/`);
      setMensaje("Check-out recorded.");
      await cargarMarcajes();
    } catch (err: any) {
      setMensaje(err?.response?.data?.detail ?? "Check-out could not be recorded.");
    } finally {
      setAccionEnCurso(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>

      {user?.rol === "employee" && (
        <div className="mt-6 rounded-lg border border-line bg-white p-6">
          <p className="text-sm text-ink/60">
            {openRecordToday
              ? `Today's check-in: ${formatearHora(openRecordToday.clock_in_time)}`
              : "You have not checked in today yet."}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={marcarEntrada}
              disabled={accionEnCurso || !!openRecordToday}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              Check in
            </button>
            <button
              onClick={marcarSalida}
              disabled={accionEnCurso || !openRecordToday}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-surface disabled:opacity-50"
            >
              Check out
            </button>
          </div>
          {mensaje && <p className="mt-3 text-sm text-ink/70">{mensaje}</p>}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-ink/60">
            <tr>
              {user?.rol !== "employee" && <th className="px-4 py-3 font-medium">Employee</th>}
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Check-in</th>
              <th className="px-4 py-3 font-medium">Check-out</th>
              <th className="px-4 py-3 font-medium">Hours</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={5}>
                  No attendance records yet.
                </td>
              </tr>
            ) : (
              records.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  {user?.rol !== "employee" && (
                    <td className="px-4 py-3">{m.employee_name ?? m.employee}</td>
                  )}
                  <td className="px-4 py-3">{m.date}</td>
                  <td className="px-4 py-3">{formatearHora(m.clock_in_time)}</td>
                  <td className="px-4 py-3">{formatearHora(m.clock_out_time)}</td>
                  <td className="px-4 py-3">{m.worked_hours ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
