import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import axios from "axios";

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
      await api.post("/api/auth/register/", {
        username,
        email,
        password,
      });
      navigate("/login");
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const data = requestError.response?.data;
        const detail = typeof data?.detail === "string"
          ? data.detail
          : data && typeof data === "object"
            ? Object.values(data).flat().join(" ")
            : null;
        setError(detail || "No se pudo completar el registro. Revisa los datos e inténtalo de nuevo.");
      } else {
        setError("No se pudo conectar con el backend.");
      }
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
          Regístrate para continuar en ChronoPay.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-line bg-white p-6">
          <div>
            <label htmlFor="register-username" className="mb-1 block text-sm font-medium">
              Usuario
            </label>
            <input
              id="register-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
              Correo electrónico
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="register-password" className="mb-1 block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="mb-1 block text-sm font-medium">
              Confirmar contraseña
            </label>
            <input
              id="register-confirm-password"
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