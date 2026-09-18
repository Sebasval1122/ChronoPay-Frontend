import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { RegistroPage } from "./pages/RegistroPage";
import { HomePage } from "./pages/HomePage";
import { AsistenciaPage } from "./pages/AsistenciaPage";
import { NominaPage } from "./pages/NominaPage";
import { UsuariosPage } from "./pages/UsuariosPage";
import { SucursalesPage } from "./pages/SucursalesPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/asistencia" element={<AsistenciaPage />} />
            <Route path="/nomina" element={<NominaPage />} />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute rolesPermitidos={["admin_general", "gerente_sucursal"]}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sucursales"
              element={
                <ProtectedRoute rolesPermitidos={["admin_general"]}>
                  <SucursalesPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
