import axios, { AxiosError } from "axios";
import { ValidationError } from "../interfaces/SharedInterfaces";

// Interface pour standardiser les erreurs API
export interface ApiErrorResponse {
  message: string;
  status: number;
  fieldErrors?: Record<string, string>;
  timestamp?: string;
  path?: string;
}

// Classe pour les erreurs personnalisées
export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  timestamp?: string;
  path?: string;

  constructor({
    message,
    status,
    fieldErrors,
    timestamp,
    path,
  }: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.timestamp = timestamp;
    this.path = path;
  }
}

// Fonction utilitaire pour gérer les erreurs
export const handleApiError = (error: unknown): ApiError => {
  // Erreur Axios (HTTP)
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ValidationError>;

    // Erreur avec réponse du serveur
    if (axiosError.response) {
      const { status, data, statusText } = axiosError.response;

      // Erreur de validation (400)
      if (status === 400 && data) {
        return new ApiError({
          message: data.message || "Mauvaise requête",
          status,
          fieldErrors: data.errors,
          timestamp: new Date().toISOString(),
          path: axiosError.config?.url || "URL inconnue",
        });
      }

      // Erreur serveur (500)
      if (status >= 500) {
        return new ApiError({
          message: data?.message || "Erreur interne du serveur",
          status,
          timestamp: new Date().toISOString(),
          path: axiosError.config?.url ?? "URL inconnue",
        });
      }

      // Autres erreurs HTTP
      return new ApiError({
        message: data?.message || statusText || "Erreur de requête",
        status,
        timestamp: new Date().toISOString(),
        path: axiosError.config?.url ?? "URL inconnue",
      });
    }

    // Erreur réseau (pas de réponse)
    return new ApiError({
      message: "Problème de connexion au serveur",
      status: 0,
      timestamp: new Date().toISOString(),
    });
  }

  // Erreur standard JavaScript
  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
      status: 0,
      timestamp: new Date().toISOString(),
    });
  }

  // Erreur inconnue
  return new ApiError({
    message: "Erreur inconnue",
    status: 0,
    timestamp: new Date().toISOString(),
  });
};
