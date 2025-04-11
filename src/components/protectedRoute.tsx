import React from "react";
import { Navigate, useLocation } from "react-router-dom";
// import { useSelector } from "react-redux"; Utiliser Redux pour gérer l'état d'authentification

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = true; //useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirige l'utilisateur non authentifié vers la page de connexion
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
