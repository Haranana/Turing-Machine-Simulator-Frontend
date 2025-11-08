import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthState = {
  token: string | null;
  tokenType: string | null; 
  expiresAt: number | null; 
  login: (token: string, tokenType: string, ttlSec: number) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { token: string; tokenType: string; expiresAt: number };
      if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
        setToken(parsed.token);
        setTokenType(parsed.tokenType);
        setExpiresAt(parsed.expiresAt);
      } else {
        localStorage.removeItem("auth");
      }
    } catch {
      localStorage.removeItem("auth");
    }
  }, []);

  const login = (t: string, typ: string, ttlSec: number) => {
    const exp = Date.now() + ttlSec * 1000;
    setToken(t);
    setTokenType(typ);
    setExpiresAt(exp);
    localStorage.setItem("auth", JSON.stringify({ token: t, tokenType: typ, expiresAt: exp }));
  };

  const logout = () => {
    setToken(null);
    setTokenType(null);
    setExpiresAt(null);
    localStorage.removeItem("auth");
  };

  const isAuthenticated = !!token && !!tokenType && !!expiresAt && Date.now() < expiresAt;

  const value = useMemo(
    () => ({ token, tokenType, expiresAt, login, logout, isAuthenticated }),
    [token, tokenType, expiresAt, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
}