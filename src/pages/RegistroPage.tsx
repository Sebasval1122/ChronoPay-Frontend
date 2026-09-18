import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function obtenerMensajeError(error: unknown) {
  if (!isAxiosError(error)) return "No se pudo conectar con el servidor.";

  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const mensajes = Object.values(data as Record<string, unknown>)
      .flatMap((valor) => (Array.isArray(valor) ? valor : [valor]))
      .filter((valor): valor is string => typeof valor === "string" && valor.trim().length > 0);

    if (mensajes.length > 0) return mensajes.join(" ");
  }

  return "No se pudo completar el registro. Revisa los datos e inténtalo de nuevo.";
}

export function RegistroPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [nombreAdmin, setNombreAdmin] = useState("");
  const [apellidoAdmin, setApellidoAdmin] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      await api.post("/api/empresas/registro/", {
        nombre_empresa: nombreEmpresa,
        nombre_admin: nombreAdmin,
        apellido_admin: apellidoAdmin,
        email,
        username,
        password,
      });
      await login(username, password);
      navigate("/");
    } catch (requestError) {
      setError(obtenerMensajeError(requestError));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-primary-dark">
          Crear cuenta
        </h1>
        <p className="mb-8 text-sm text-ink/60">
          Registra tu empresa para comenzar en ChronoPay.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-line bg-white p-6">
          <div>
            <label htmlFor="nombre-empresa" className="mb-1 block text-sm font-medium">
              Nombre de la empresa
            </label>
            <input
              id="nombre-empresa"
              value={nombreEmpresa}
              onChange={(event) => setNombreEmpresa(event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="nombre-admin" className="mb-1 block text-sm font-medium">
              Nombres del administrador
            </label>
            <input
              id="nombre-admin"
              value={nombreAdmin}
              onChange={(event) => setNombreAdmin(event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="given-name"
              required
            />
          </div>

          <div>
            <label htmlFor="apellido-admin" className="mb-1 block text-sm font-medium">
              Apellidos del administrador
            </label>
            <input
              id="apellido-admin"
              value={apellidoAdmin}
              onChange={(event) => setApellidoAdmin(event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="family-name"
              required
            />
          </div>

          <div>
            <label htmlFor="registro-email" className="mb-1 block text-sm font-medium">
              Correo electrónico
            </label>
            <input
              id="registro-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="registro-username" className="mb-1 block text-sm font-medium">
              Usuario
            </label>
            <input
              id="registro-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="registro-password" className="mb-1 block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="registro-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmar-password" className="mb-1 block text-sm font-medium">
              Confirmar contraseña
            </label>
            <input
              id="confirmar-password"
              type="password"
              value={confirmarPassword}
              onChange={(event) => setConfirmarPassword(event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-md bg-alert-light px-3 py-2 text-sm text-alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {enviando ? "Registrando…" : "Registrar"}
          </button>

          <Link to="/login" className="block text-center text-sm text-primary hover:underline">
            Ya tengo una cuenta
          </Link>
        </form>
      </div>
    </div>
  );
}
