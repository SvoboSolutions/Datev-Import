import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, logout } from "../api/auth";

type AuthContextValue = {
  authenticated: boolean;
  refreshAuth: () => Promise<void>;
  logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refreshAuth() {
    try {
      await fetchMe();
      setAuthenticated(true);
    } catch {
      setAuthenticated(false);
    }
  }

  async function logoutUser() {
    try {
      await logout();
    } finally {
      setAuthenticated(false);
    }
  }

  useEffect(() => {
    refreshAuth().finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{ authenticated, refreshAuth, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
