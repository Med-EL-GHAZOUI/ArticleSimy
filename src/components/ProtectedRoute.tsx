import React from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Role[];
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role") as Role | null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && userRole && !roles.includes(userRole)) {
    return <Navigate to="/articles" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
