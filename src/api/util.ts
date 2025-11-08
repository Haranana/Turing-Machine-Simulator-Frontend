import { useAuth } from "../auth/AuthContext";

export const API_BASE = "http://localhost:9090";

//Fetch wrapper with added authorization
export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const { token, tokenType, expiresAt, logout } = useAuth();

  const headers = new Headers(init.headers);

  if (!token || !tokenType || (expiresAt && Date.now() >= expiresAt)) {
    logout();
    throw new Error("Unauthorized");
  }

  headers.set("Authorization", `${tokenType} ${token}`);

  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    logout();
  }
  return res;
}