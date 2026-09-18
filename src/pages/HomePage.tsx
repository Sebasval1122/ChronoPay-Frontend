import { useAuth } from "../auth/AuthContext";

const SALUDO_ROL: Record<string, string> = {
  admin_general: "Tienes visibilidad de todas las sucursales.",
  gerente_sucursal: "Aquí puedes gestionar la asistencia y nómina de tu sucursal.",
  empleado: "Marca tu asistencia y consulta tu nómina desde aquí.",
};

export function HomePage() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Hola, {usuario.first_name || usuario.username}
      </h1>
      <p className="mt-2 text-ink/60">{SALUDO_ROL[usuario.rol]}</p>
    </div>
  );
}
