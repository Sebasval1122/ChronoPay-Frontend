import { useEffect, useState, type FormEvent } from "react";
import { api, getListData } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { TimeOffRequest, RequestType, RequestStatus } from "../api/types";

const TYPE_LABEL: Record<RequestType, string> = {
  vacaciones: "Vacation",
  permission: "Permission",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pendiente: "Pending",
  approved: "Approved",
  rechazada: "Rejected",
};

const STATUS_STYLE: Record<RequestStatus, string> = {
  pendiente: "bg-surface text-ink/70",
  approved: "bg-green-100 text-green-700",
  rechazada: "bg-alert-light text-alert",
};

export function TimeOffRequestsPage() {
  const { user } = useAuth();
  const canResolve = user?.rol === "admin_general" || user?.rol === "gerente_sucursal";

  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "vacaciones" as RequestType,
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [enviando, setEnviando] = useState(false);

  const [resolviendo, setResolviendo] = useState<number | null>(null);
  const [comentarios, setComentarios] = useState<Record<number, string>>({});

  async function cargarSolicitudes() {
    setCargando(true);
    try {
      const { data } = await api.get<TimeOffRequest[] | { results: TimeOffRequest[] }>(
        "/api/time_off_requests/",
      );
      setRequests(getListData(data));
    } catch {
      setMensaje("Requests could not be loaded.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  async function crearSolicitud(event: FormEvent) {
    event.preventDefault();
    setMensaje(null);

    if (form.end_date < form.start_date) {
      setMensaje("The end date cannot be before the start date.");
      return;
    }

    setEnviando(true);
    try {
      await api.post("/api/time_off_requests/", form);
      setForm({ type: "vacaciones", start_date: "", end_date: "", reason: "" });
      await cargarSolicitudes();
    } catch {
      setMensaje("The request could not be created.");
    } finally {
      setEnviando(false);
    }
  }

  async function resolver(id: number, status: Extract<RequestStatus, "approved" | "rechazada">) {
    setResolviendo(id);
    setMensaje(null);
    try {
      await api.post(`/api/time_off_requests/${id}/resolve/`, {
        status,
        review_comment: comentarios[id] ?? "",
      });
      await cargarSolicitudes();
    } catch {
      setMensaje("The request could not be resolved.");
    } finally {
      setResolviendo(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Time off requests</h1>
      <p className="mt-2 text-sm text-ink/60">
        {canResolve
          ? "Review and resolve vacation and permission requests."
          : "Request vacation days or permissions and track their status."}
      </p>

      <form
        onSubmit={crearSolicitud}
        className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-line bg-white p-6 sm:grid-cols-4"
      >
        <select
          value={form.type}
          onChange={(event) => setForm({ ...form, type: event.target.value as RequestType })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          <option value="vacaciones">Vacation</option>
          <option value="permission">Permission</option>
        </select>
        <input
          type="date"
          value={form.start_date}
          onChange={(event) => setForm({ ...form, start_date: event.target.value })}
          required
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={form.end_date}
          onChange={(event) => setForm({ ...form, end_date: event.target.value })}
          required
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {enviando ? "Sending…" : "Send request"}
        </button>
        <textarea
          value={form.reason}
          onChange={(event) => setForm({ ...form, reason: event.target.value })}
          placeholder="Reason (e.g. Annual vacation, medical appointment)"
          required
          rows={2}
          className="rounded-md border border-line px-3 py-2 text-sm sm:col-span-4"
        />
      </form>

      {mensaje && <p className="mt-3 text-sm text-alert">{mensaje}</p>}

      {cargando ? (
        <div className="mt-6 rounded-lg border border-line bg-white px-4 py-4 text-sm text-ink/50">
          Loading…
        </div>
      ) : requests.length === 0 ? (
        <div className="mt-6 rounded-lg border border-line bg-white px-4 py-4 text-sm text-ink/50">
          No requests yet.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-ink/60">
              <tr>
                {canResolve && <th className="px-4 py-3 font-medium">Employee</th>}
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canResolve && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-line align-top last:border-0">
                  {canResolve && <td className="px-4 py-3">{request.requester_name}</td>}
                  <td className="px-4 py-3">{TYPE_LABEL[request.type]}</td>
                  <td className="px-4 py-3">
                    {request.start_date} → {request.end_date}
                  </td>
                  <td className="px-4 py-3 max-w-xs">{request.reason}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLE[request.status]}`}
                    >
                      {STATUS_LABEL[request.status]}
                    </span>
                    {request.review_comment && (
                      <p className="mt-1 text-xs text-ink/50">{request.review_comment}</p>
                    )}
                  </td>
                  {canResolve && (
                    <td className="px-4 py-3">
                      {request.status === "pendiente" ? (
                        <div className="flex flex-col gap-2">
                          <input
                            value={comentarios[request.id] ?? ""}
                            onChange={(event) =>
                              setComentarios({ ...comentarios, [request.id]: event.target.value })
                            }
                            placeholder="Comment (optional)"
                            className="rounded-md border border-line px-2 py-1 text-xs"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={resolviendo === request.id}
                              onClick={() => resolver(request.id, "approved")}
                              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={resolviendo === request.id}
                              onClick={() => resolver(request.id, "rechazada")}
                              className="rounded-md border border-line px-3 py-1 text-xs font-medium text-ink/70 hover:bg-surface disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-ink/40">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}