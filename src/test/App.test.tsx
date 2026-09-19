import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

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
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/" element={<p>Authenticated home</p>} />
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

describe("RegisterPage", () => {
  const loginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      login: loginMock,
      user: null,
      loading: false,
      error: null,
      logout: vi.fn(),
    });
  });

  it("submits registration, signs in, and redirects home", async () => {
    const user = userEvent.setup();
    postMock.mockResolvedValue({ data: { id: 1 } } as never);
    loginMock.mockResolvedValue(undefined);
    renderRegistro();

    await user.type(screen.getByLabelText("Company name"), "ChronoPay SAS");
    await user.type(screen.getByLabelText("Administrator first name"), "Ana");
    await user.type(screen.getByLabelText("Administrator last name"), "Pérez");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Username"), "ana.perez");
    await user.type(screen.getByLabelText("Password"), "ClaveSegura123!");
    await user.type(screen.getByLabelText("Confirm password"), "ClaveSegura123!");
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => expect(screen.getByText("Authenticated home")).toBeInTheDocument());
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

  it("rejects mismatched passwords without calling the backend", async () => {
    const user = userEvent.setup();
    renderRegistro();

    await user.type(screen.getByLabelText("Company name"), "ChronoPay SAS");
    await user.type(screen.getByLabelText("Administrator first name"), "Ana");
    await user.type(screen.getByLabelText("Administrator last name"), "Pérez");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Username"), "ana.perez");
    await user.type(screen.getByLabelText("Password"), "ClaveSegura123!");
    await user.type(screen.getByLabelText("Confirm password"), "OtraClave123!");
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("The passwords do not match.")).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });

  it("shows a connection error and preserves entered data", async () => {
    const user = userEvent.setup();
    postMock.mockRejectedValue(new Error("network error"));
    renderRegistro();

    const empresa = screen.getByLabelText("Company name");
    await user.type(empresa, "Empresa persistente");
    await user.type(screen.getByLabelText("Administrator first name"), "Ana");
    await user.type(screen.getByLabelText("Administrator last name"), "Pérez");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Username"), "ana.perez");
    await user.type(screen.getByLabelText("Password"), "ClaveSegura123!");
    await user.type(screen.getByLabelText("Confirm password"), "ClaveSegura123!");
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Could not connect to the server.")).toBeInTheDocument();
    expect(empresa).toHaveValue("Empresa persistente");
  });
});

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      user: null,
      loading: false,
      error: null,
      logout: vi.fn(),
    });
  });

  it("shows the link to public registration", () => {
    renderLogin();

    expect(screen.getByRole("link", { name: "Don't have an account? Register" })).toHaveAttribute(
      "href",
      "/registro",
    );
  });
});

describe("ProtectedRoute", () => {
  it("redirige al login cuando no hay usuario autenticado", () => {
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      user: null,
      loading: false,
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
      user: {
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
      loading: false,
      error: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin_general"]}>
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
