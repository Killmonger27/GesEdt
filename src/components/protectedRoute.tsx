import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (isLoading) {
    // Afficher un spinner pendant le chargement
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    // Redirige l'utilisateur non authentifié vers la page de connexion
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
