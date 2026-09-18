import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Nomina } from "../api/types";

function formatearMoneda(valor: string) {
  return Number(valor).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export function NominaPage() {
  const { usuario } = useAuth();
  const [nominas, setNominas] = useState<Nomina[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get<Nomina[]>("/api/nomina/nominas/").then(({ data }) => {
      setNominas(data);
      setCargando(false);
    }).catch(() => setCargando(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Nómina</h1>
      <p className="mt-2 text-sm text-ink/60">
        {usuario?.rol === "empleado" ? "Consulta tus periodos de nómina." : "Periodos de nómina registrados."}
      </p>
      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Periodo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td className="px-4 py-4 text-ink/50" colSpan={3}>Cargando...</td></tr>
            ) : nominas.length === 0 ? (
              <tr><td className="px-4 py-4 text-ink/50" colSpan={3}>No hay nóminas disponibles.</td></tr>
            ) : nominas.map((nomina) => (
              <tr key={nomina.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{nomina.periodo_inicio} - {nomina.periodo_fin}</td>
                <td className="px-4 py-3">{nomina.estado}</td>
                <td className="px-4 py-3">{formatearMoneda(nomina.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}