import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@auth/hooks/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? <Outlet />: <Navigate to="/app/login" replace state={{ from: location }} />;
}