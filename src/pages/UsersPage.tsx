import { useEffect, useState, type FormEvent } from "react";
import { api, getListData } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Role, User } from "../api/types";

const ROLE_LABEL: Record<Role, string> = {
  admin_general: "General admin",
  gerente_sucursal: "Branch manager",
  empleado: "Employee",
};

const ESTADO_INICIAL = {
  username: "",
  password: "",
  first_name: "",
  last_name: "",
  rol: "empleado" as Role,
  sucursal: "",
  salario_actual: "",
};

export function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get<User[] | { results: User[] }>("/api/usuarios/");
      setUsers(getListData(data));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crearUsuario(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await api.post("/api/usuarios/", {
        ...form,
        sucursal: form.sucursal ? Number(form.sucursal) : null,
        salario_actual: form.salario_actual || null,
      });
      setForm(ESTADO_INICIAL);
      await cargar();
    } catch (err: any) {
      setMensaje(
        typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : "The user could not be created."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>

      <form
        onSubmit={crearUsuario}
        className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-line bg-white p-6 sm:grid-cols-3"
      >
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="First name"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Last name"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <select
          value={form.rol}
          onChange={(e) => setForm({ ...form, rol: e.target.value as Role })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          {user?.rol === "admin_general" && <option value="admin_general">General admin</option>}
          <option value="gerente_sucursal">Branch manager</option>
          <option value="empleado">Employee</option>
        </select>
        <input
          placeholder="Branch ID"
          value={form.sucursal}
          onChange={(e) => setForm({ ...form, sucursal: e.target.value })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Monthly salary"
          value={form.salario_actual}
          onChange={(e) => setForm({ ...form, salario_actual: e.target.value })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {guardando ? "Creating…" : "Create user"}
        </button>
      </form>

      {mensaje && <p className="mt-3 break-words text-sm text-alert">{mensaje}</p>}

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Sucursal</th>
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
              users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{ROLE_LABEL[u.rol]}</td>
                  <td className="px-4 py-3">{u.sucursal ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
