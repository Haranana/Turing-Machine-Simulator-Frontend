import { useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

export const API_BASE = "http://localhost:9090";

//Fetch wrapper with added authorization
export function useApiFetch() {
  const { token, tokenType, logout } = useAuth();
  return useCallback(async (input: RequestInfo, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `${tokenType ?? "Bearer"} ${token}`);
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401) logout();
    return res;
  }, [token, tokenType, logout]);
}