import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, tokenStorage } from "../api/client";
import type { Usuario, LoginResponse } from "../api/types";

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarUsuarioActual() {
    try {
      const { data } = await api.get<Usuario>("/api/usuarios/me/");
      setUsuario(data);
    } catch {
      tokenStorage.clear();
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (tokenStorage.getAccess()) {
      cargarUsuarioActual();
    } else {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(username: string, password: string) {
    setError(null);
    try {
      const { data } = await api.post<LoginResponse>("/api/auth/login/", {
        username,
        password,
      });
      tokenStorage.setTokens(data.access, data.refresh);
      await cargarUsuarioActual();
    } catch {
      setError("Usuario o contraseña incorrectos.");
      throw new Error("login_failed");
    }
  }

  function logout() {
    tokenStorage.clear();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
