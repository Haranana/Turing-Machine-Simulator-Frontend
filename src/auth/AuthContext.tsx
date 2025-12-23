import { createContext, useContext, useMemo, useState } from "react";

type AuthState = {
  token: string | null;
  tokenType: string | null; 
  expiresAt: number | null; 
  login: (token: string, tokenType: string, ttlSec: number, rememberMe: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "auth";

type StoredAuth = {
  token: string;
  tokenType: string;
  expiresAt: number;
};

function loadAuth(): { token: string | null; tokenType: string | null; expiresAt: number | null;} {
  try {

    // session storage (no remember me)
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);

    if (!raw) return { token: null, tokenType: null, expiresAt: null };

    const parsed = JSON.parse(raw) as StoredAuth;
    
    if (!parsed.expiresAt || Date.now() >= parsed.expiresAt) {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
      return { token: null, tokenType: null, expiresAt: null };
    }

    return {
      token: parsed.token,
      tokenType: parsed.tokenType,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    return { token: null, tokenType: null, expiresAt: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ token, tokenType, expiresAt }, setAuthState] = useState(loadAuth);

  const login = (t: string, typ: string, ttlSec: number, rememberMe: boolean) => {
    const exp = Date.now() + ttlSec * 1000;

    setAuthState({ token: t, tokenType: typ, expiresAt: exp });

    const data: StoredAuth = { token: t, tokenType: typ, expiresAt: exp };

    const targetStorage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    targetStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    otherStorage.removeItem(STORAGE_KEY);
  };

  const logout = () => {
    setAuthState({ token: null, tokenType: null, expiresAt: null });
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
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