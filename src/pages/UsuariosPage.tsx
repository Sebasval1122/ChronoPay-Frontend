import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Rol, Usuario } from "../api/types";

const ETIQUETA_ROL: Record<Rol, string> = {
  admin_general: "Admin general",
  gerente_sucursal: "Gerente de sucursal",
  empleado: "Empleado",
};

const ESTADO_INICIAL = {
  username: "",
  password: "",
  first_name: "",
  last_name: "",
  rol: "empleado" as Rol,
  sucursal: "",
  salario_actual: "",
};

export function UsuariosPage() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get<Usuario[]>("/api/usuarios/");
      setUsuarios(data);
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
          : "No se pudo crear el usuario."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>

      <form
        onSubmit={crearUsuario}
        className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-line bg-white p-6 sm:grid-cols-3"
      >
        <input
          placeholder="Usuario"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Nombres"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Apellidos"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <select
          value={form.rol}
          onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          {usuario?.rol === "admin_general" && <option value="admin_general">Admin general</option>}
          <option value="gerente_sucursal">Gerente de sucursal</option>
          <option value="empleado">Empleado</option>
        </select>
        <input
          placeholder="ID sucursal"
          value={form.sucursal}
          onChange={(e) => setForm({ ...form, sucursal: e.target.value })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Salario mensual"
          value={form.salario_actual}
          onChange={(e) => setForm({ ...form, salario_actual: e.target.value })}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {guardando ? "Creando…" : "Crear usuario"}
        </button>
      </form>

      {mensaje && <p className="mt-3 break-words text-sm text-alert">{mensaje}</p>}

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Sucursal</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={4}>
                  Cargando…
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{ETIQUETA_ROL[u.rol]}</td>
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
