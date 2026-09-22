import { useState } from "react";
import { isAxiosError } from "axios";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function ReportsPage() {
  const { user } = useAuth();
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function descargarCSV() {
    setDescargando(true);
    setError(null);
    try {
      const response = await api.get("/api/reports/payroll.csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "payroll-report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      if (isAxiosError(requestError) && requestError.response?.status === 403) {
        setError("You don't have permission to download this report.");
      } else {
        setError("The report could not be downloaded.");
      }
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      <p className="mt-2 text-sm text-ink/60">
        {user?.rol === "employee"
          ? "Download a CSV with your own payroll records."
          : user?.rol === "gerente_sucursal"
            ? "Download a CSV with your branch's payroll records."
            : "Download a CSV with all payroll records."}
      </p>

      <div className="mt-6 rounded-lg border border-line bg-white p-6">
        <h2 className="font-medium">Payroll report (CSV)</h2>
        <p className="mt-1 text-sm text-ink/60">
          Employee, branch, period, base salary, withholding and net total.
        </p>
        <button
          type="button"
          onClick={descargarCSV}
          disabled={descargando}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {descargando ? "Downloading…" : "Download CSV"}
        </button>
        {error && <p className="mt-3 text-sm text-alert">{error}</p>}
      </div>
    </div>
  );
}