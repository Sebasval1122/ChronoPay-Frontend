import { useEffect, useState, type FormEvent } from "react";
import { api, getListData } from "../api/client";
import type { Branch } from "../api/types";

const ESTADO_INICIAL = { nombre: "", codigo: "", ciudad: "", direccion: "" };

export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get<Branch[] | { results: Branch[] }>("/api/sucursales/");
      setBranches(getListData(data));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setMensaje(null);
    try {
      await api.post("/api/sucursales/", form);
      setForm(ESTADO_INICIAL);
      await cargar();
    } catch {
      setMensaje("The branch could not be created (check that the code is unique).");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Branches</h1>

      <form
        onSubmit={crear}
        className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-line bg-white p-6 sm:grid-cols-4"
      >
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Code"
          value={form.codigo}
          onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          required
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="City"
          value={form.ciudad}
          onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Address"
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="col-span-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark sm:col-span-1"
        >
          Create branch
        </button>
      </form>

      {mensaje && <p className="mt-3 text-sm text-alert">{mensaje}</p>}

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">City</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={4}>
                  Loading…
                </td>
              </tr>
            ) : (
              branches.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3">{s.nombre}</td>
                  <td className="px-4 py-3">{s.codigo}</td>
                  <td className="px-4 py-3">{s.ciudad}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
