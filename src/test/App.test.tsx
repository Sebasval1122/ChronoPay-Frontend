import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { LoginPage } from "../pages/LoginPage";
import { RegistroPage } from "../pages/RegistroPage";

vi.mock("../api/client", () => ({
  api: { post: vi.fn() },
}));

vi.mock("../auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const postMock = vi.mocked(api.post);
const useAuthMock = vi.mocked(useAuth);

function renderRegistro() {
  return render(
    <MemoryRouter initialEntries={["/registro"]}>
      <Routes>
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/" element={<p>Inicio autenticado</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("RegistroPage", () => {
  const loginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      login: loginMock,
      usuario: null,
      cargando: false,
      error: null,
      logout: vi.fn(),
    });
  });

  it("envía el registro, inicia sesión y redirige al inicio", async () => {
    const user = userEvent.setup();
    postMock.mockResolvedValue({ data: { id: 1 } } as never);
    loginMock.mockResolvedValue(undefined);
    renderRegistro();

    await user.type(screen.getByLabelText("Nombre de la empresa"), "ChronoPay SAS");
    await user.type(screen.getByLabelText("Nombres del administrador"), "Ana");
    await user.type(screen.getByLabelText("Apellidos del administrador"), "Pérez");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await user.type(screen.getByLabelText("Usuario"), "ana.perez");
    await user.type(screen.getByLabelText("Contraseña"), "ClaveSegura123!");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "ClaveSegura123!");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => expect(screen.getByText("Inicio autenticado")).toBeInTheDocument());
    expect(postMock).toHaveBeenCalledWith("/api/empresas/registro/", {
      nombre_empresa: "ChronoPay SAS",
      nombre_admin: "Ana",
      apellido_admin: "Pérez",
      email: "ana@example.com",
      username: "ana.perez",
      password: "ClaveSegura123!",
    });
    expect(loginMock).toHaveBeenCalledWith("ana.perez", "ClaveSegura123!");
  });

  it("rechaza contraseñas diferentes sin llamar al backend", async () => {
    const user = userEvent.setup();
    renderRegistro();

    await user.type(screen.getByLabelText("Nombre de la empresa"), "ChronoPay SAS");
    await user.type(screen.getByLabelText("Nombres del administrador"), "Ana");
    await user.type(screen.getByLabelText("Apellidos del administrador"), "Pérez");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await user.type(screen.getByLabelText("Usuario"), "ana.perez");
    await user.type(screen.getByLabelText("Contraseña"), "ClaveSegura123!");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "OtraClave123!");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });

  it("muestra un error de conexión y conserva los datos escritos", async () => {
    const user = userEvent.setup();
    postMock.mockRejectedValue(new Error("network error"));
    renderRegistro();

    const empresa = screen.getByLabelText("Nombre de la empresa");
    await user.type(empresa, "Empresa persistente");
    await user.type(screen.getByLabelText("Nombres del administrador"), "Ana");
    await user.type(screen.getByLabelText("Apellidos del administrador"), "Pérez");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await user.type(screen.getByLabelText("Usuario"), "ana.perez");
    await user.type(screen.getByLabelText("Contraseña"), "ClaveSegura123!");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "ClaveSegura123!");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByText("No se pudo conectar con el servidor.")).toBeInTheDocument();
    expect(empresa).toHaveValue("Empresa persistente");
  });
});

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      usuario: null,
      cargando: false,
      error: null,
      logout: vi.fn(),
    });
  });

  it("muestra el enlace hacia el registro público", () => {
    renderLogin();

    expect(screen.getByRole("link", { name: "¿No tienes cuenta? Regístrate" })).toHaveAttribute(
      "href",
      "/registro",
    );
  });
});

describe("ProtectedRoute", () => {
  it("redirige al login cuando no hay usuario autenticado", () => {
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      usuario: null,
      cargando: false,
      error: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/privado"]}>
        <Routes>
          <Route
            path="/privado"
            element={
              <ProtectedRoute>
                <p>Contenido privado</p>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<p>Pantalla de login</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Pantalla de login")).toBeInTheDocument();
  });

  it("redirige al inicio si el rol no está permitido", () => {
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      usuario: {
        id: 1,
        username: "empleado",
        first_name: "",
        last_name: "",
        email: "empleado@example.com",
        cedula: null,
        telefono: "",
        rol: "empleado",
        sucursal: null,
        salario_actual: null,
        activo: true,
        date_joined: "2026-01-01",
      },
      cargando: false,
      error: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute rolesPermitidos={["admin_general"]}>
                <p>Administración</p>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<p>Inicio</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });
});
