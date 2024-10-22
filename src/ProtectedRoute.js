import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, userData } = useAuth();

  if (isAuthenticated === null) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Verificar si el rol del usuario está incluido en los roles permitidos
  if (roles && !roles.includes(userData?.rol)) {
    return <Navigate to="/not-authorized" />;
  }

  return children;
};

export default ProtectedRoute;  // Asegúrate de tener esta línea
