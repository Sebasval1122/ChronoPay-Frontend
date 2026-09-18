import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const CAMPOS_REGISTRO = [
  "nombre_empresa",
  "nombre_admin",
  "apellido_admin",
  "email",
  "username",
  "password",
] as const;

type CampoRegistro = (typeof CAMPOS_REGISTRO)[number];
type ErroresCampo = Partial<Record<CampoRegistro, string>>;

const MENSAJES_VALIDACION: Record<string, string> = {
  "This password is too common.": "Esta contraseña es demasiado común.",
  "This password is too similar to the username.":
    "Esta contraseña es demasiado similar al usuario.",
  "This password is entirely numeric.": "La contraseña no puede contener solo números.",
  "Enter a valid email address.": "Ingresa una dirección de correo válida.",
  "This field may not be blank.": "Este campo no puede estar vacío.",
  "This field is required.": "Este campo es obligatorio.",
};

function traducirMensaje(mensaje: string) {
  const mensajeCorto = mensaje.match(
    /^This password is too short\. It must contain at least (\d+) characters\.$/,
  );
  if (mensajeCorto) {
    return `La contraseña es demasiado corta. Debe contener al menos ${mensajeCorto[1]} caracteres.`;
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
  const fallback = "No se pudo completar el registro. Revisa los datos e inténtalo de nuevo.";
  if (!isAxiosError(error)) return { erroresCampo: {}, general: "No se pudo conectar con el servidor." };

  if (error.response?.status === 429) {
    return {
      erroresCampo: {},
      general: "Has intentado registrarte demasiadas veces. Espera unos minutos e inténtalo de nuevo.",
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
  const [erroresCampo, setErroresCampo] = useState<ErroresCampo>({});
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setErroresCampo({});

    if (password !== confirmarPassword) {
      setErroresCampo({ password: "Las contraseñas no coinciden." });
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
              placeholder="Ej: Cadena Los Andes"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              required
            />
            {erroresCampo.nombre_empresa && (
              <p className="mt-1 text-sm text-alert">{erroresCampo.nombre_empresa}</p>
            )}
          </div>

          <div>
            <label htmlFor="nombre-admin" className="mb-1 block text-sm font-medium">
              Nombres del administrador
            </label>
            <input
              id="nombre-admin"
              value={nombreAdmin}
              onChange={(event) => setNombreAdmin(event.target.value)}
              placeholder="Ej: Ana"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="given-name"
              required
            />
            {erroresCampo.nombre_admin && (
              <p className="mt-1 text-sm text-alert">{erroresCampo.nombre_admin}</p>
            )}
          </div>

          <div>
            <label htmlFor="apellido-admin" className="mb-1 block text-sm font-medium">
              Apellidos del administrador
            </label>
            <input
              id="apellido-admin"
              value={apellidoAdmin}
              onChange={(event) => setApellidoAdmin(event.target.value)}
              placeholder="Ej: Gómez"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="family-name"
              required
            />
            {erroresCampo.apellido_admin && (
              <p className="mt-1 text-sm text-alert">{erroresCampo.apellido_admin}</p>
            )}
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
              placeholder="Ej: ana@losandes.com"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
              autoComplete="email"
              required
            />
            {erroresCampo.email && <p className="mt-1 text-sm text-alert">{erroresCampo.email}</p>}
          </div>

          <div>
            <label htmlFor="registro-username" className="mb-1 block text-sm font-medium">
              Usuario
            </label>
            <input
              id="registro-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ej: anagomez"
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
              Contraseña
            </label>
            <input
              id="registro-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres, sin datos personales ni contraseñas comunes"
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
              Confirmar contraseña
            </label>
            <input
              id="confirmar-password"
              type="password"
              value={confirmarPassword}
              onChange={(event) => setConfirmarPassword(event.target.value)}
              placeholder="Repite la contraseña anterior"
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
