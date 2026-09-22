import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { AttendancePage } from "./pages/AttendancePage";
import { PayrollPage } from "./pages/PayrollPage";
import { UsersPage } from "./pages/UsersPage";
import { BranchesPage } from "./pages/BranchesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TimeOffRequestsPage } from "./pages/TimeOffRequestsPage";
import { ReportsPage } from "./pages/ReportsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/asistencia" element={<AttendancePage />} />
            <Route path="/nomina" element={<PayrollPage />} />
            <Route path="/solicitudes" element={<TimeOffRequestsPage />} />
            <Route path="/reportes" element={<ReportsPage />} />  
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin_general", "gerente_sucursal"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={["admin_general", "gerente_sucursal"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sucursales"
              element={
                <ProtectedRoute allowedRoles={["admin_general"]}>
                  <BranchesPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
