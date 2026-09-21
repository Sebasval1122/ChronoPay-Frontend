import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const CAMPOS_REGISTRO = [
  "company_name",
  "admin_first_name",
  "admin_last_name",
  "email",
  "username",
  "password",
] as const;

type CampoRegistro = (typeof CAMPOS_REGISTRO)[number];
type ErroresCampo = Partial<Record<CampoRegistro, string>>;

const MENSAJES_VALIDACION: Record<string, string> = {
  "This password is too common.": "This password is too common.",
  "This password is too similar to the username.":
    "This password is too similar to the username.",
  "This password is entirely numeric.": "The password cannot contain only numbers.",
  "Enter a valid email address.": "Enter a valid email address.",
  "This field may not be blank.": "This field cannot be blank.",
  "This field is required.": "This field is required.",
};

function traducirMensaje(mensaje: string) {
  const mensajeCorto = mensaje.match(
    /^This password is too short\. It must contain at least (\d+) characters\.$/,
  );
  if (mensajeCorto) {
    return `The password is too short. It must contain at least ${mensajeCorto[1]} characters.`;
  }

  return MENSAJES_VALIDACION[mensaje] ?? mensaje;
}

function obtenerMensajes(valor: unknown) {
  const valores = Array.isArray(valor) ? valor : [valor];
  return valores
    .filter((mensaje): mensaje is string => typeof mensaje === "string" && mensaje.trim().length > 0)
    .map(traducirMensaje);
}

function analizarError(error: unknown): { erroresCampo: ErroresCampo; general: string | null } {
  const fallback = "Registration could not be completed. Check the information and try again.";
  if (!isAxiosError(error)) return { erroresCampo: {}, general: "Could not connect to the server." };

  if (error.response?.status === 429) {
    return {
      erroresCampo: {},
      general: "You have tried to register too many times. Wait a few minutes and try again.",
    };
  }

  const data = error.response?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { erroresCampo: {}, general: fallback };
  }

  const erroresCampo: ErroresCampo = {};
  const mensajesGenerales: string[] = [];
  let respuestaReconocida = false;

  for (const [campo, valor] of Object.entries(data as Record<string, unknown>)) {
    const mensajes = obtenerMensajes(valor);
    if (CAMPOS_REGISTRO.includes(campo as CampoRegistro)) {
      if (mensajes.length > 0) erroresCampo[campo as CampoRegistro] = mensajes.join(" ");
      respuestaReconocida = true;
    } else if (campo === "non_field_errors" || campo === "detail") {
      if (mensajes.length > 0) mensajesGenerales.push(...mensajes);
      respuestaReconocida = true;
    }
  }

  return {
    erroresCampo,
    general: mensajesGenerales.length > 0
      ? mensajesGenerales.join(" ")
      : respuestaReconocida
        ? null
        : fallback,
  };
}

export function RegisterPage() {
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
  const [erroresCampo, setErroresCampo] = useState<ErroresCampo>({});
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setErroresCampo({});

    if (password !== confirmarPassword) {
      setErroresCampo({ password: "The passwords do not match." });
      return;
    }

    setEnviando(true);
    try {
        await api.post("/api/companies/register/", {
        company_name: nombreEmpresa,
        admin_first_name: nombreAdmin,
        admin_last_name: apellidoAdmin,
        email,
        username,
        password,
      });
      await login(username, password);
      navigate("/");
    } catch (requestError) {
      const resultado = analizarError(requestError);
      setErroresCampo(resultado.erroresCampo);
      setError(resultado.general);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-primary-dark">
          Create account
        </h1>
        <p className="mb-8 text-sm text-ink/60">
          Register your company to get started with ChronoPay.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-line bg-white p-6">
          <div>
            <label htmlFor="nombre-empresa" className="mb-1 block text-sm font-medium">
              Company name
            </label>
            <input
              id="nombre-empresa"
              value={nombreEmpresa}
              onChange={(event) => setNombreEmpresa(event.target.value)}
              placeholder="E.g. Andes Retail"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              required
            />
            {erroresCampo.company_name && (
              <p className="mt-1 text-sm text-alert">{erroresCampo.company_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="nombre-admin" className="mb-1 block text-sm font-medium">
              Administrator first name
            </label>
            <input
              id="nombre-admin"
              value={nombreAdmin}
              onChange={(event) => setNombreAdmin(event.target.value)}
              placeholder="E.g. Ana"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="given-name"
              required
            />
            {erroresCampo.admin_first_name && (
              <p className="mt-1 text-sm text-alert">{erroresCampo.admin_first_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="apellido-admin" className="mb-1 block text-sm font-medium">
              Administrator last name
            </label>
            <input
              id="apellido-admin"
              value={apellidoAdmin}
              onChange={(event) => setApellidoAdmin(event.target.value)}
              placeholder="E.g. Gomez"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="family-name"
              required
            />
            {erroresCampo.admin_last_name && (
              <p className="mt-1 text-sm text-alert">{erroresCampo.admin_last_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="registro-email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="registro-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="E.g. ana@example.com"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="email"
              required
            />
            {erroresCampo.email && <p className="mt-1 text-sm text-alert">{erroresCampo.email}</p>}
          </div>

          <div>
            <label htmlFor="registro-username" className="mb-1 block text-sm font-medium">
              Username
            </label>
            <input
              id="registro-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="E.g. anagomez"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="username"
              required
            />
            {erroresCampo.username && (
              <p className="mt-1 text-sm text-alert">{erroresCampo.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="registro-password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="registro-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters; avoid personal details and common passwords"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="new-password"
              required
            />
            {erroresCampo.password && (
              <p className="mt-1 text-sm text-alert">{erroresCampo.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmar-password" className="mb-1 block text-sm font-medium">
              Confirm password
            </label>
            <input
              id="confirmar-password"
              type="password"
              value={confirmarPassword}
              onChange={(event) => setConfirmarPassword(event.target.value)}
              placeholder="Repeat your password"
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
            {enviando ? "Registering…" : "Register"}
          </button>

          <Link to="/login" className="block text-center text-sm text-primary hover:underline">
            I already have an account
          </Link>
        </form>
      </div>
    </div>
  );
}
