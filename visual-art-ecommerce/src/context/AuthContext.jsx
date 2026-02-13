import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

// credenciais mock (troque depois por API)
const MOCK_USERS = [
  { email: "admin@loja.com", password: "123456", name: "Administrador", role: "ADMIN" },
  { email: "cliente@loja.com", password: "123456", name: "Cliente", role: "CLIENTE" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login(email, password) {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) {
      return { ok: false, message: "E-mail ou senha inválidos" };
    }
    setUser({ name: found.name, role: found.role, email: found.email });
    return { ok: true, role: found.role };
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(() => {
    const isLoggedIn = !!user;
    const role = user?.role ?? null;

    return {
      user,
      role,
      isLoggedIn,
      login,
      logout,
      setUser, // ✅ necessário para cadastro funcionar

      loginAsAdmin: () =>
        setUser({ name: "Administrador", role: "ADMIN", email: "admin@loja.com" }),

      loginAsClient: () =>
        setUser({ name: "Cliente", role: "CLIENTE", email: "cliente@loja.com" }),
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
