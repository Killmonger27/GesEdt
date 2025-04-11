import axios, { AxiosError } from "axios";
import { ValidationError } from "../interfaces/SharedInterfaces";

// Classe pour les erreurs personnalisées
export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Fonction utilitaire pour gérer les erreurs
export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ValidationError>;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      if (status === 400 && data) {
        // Erreurs de validation
        if (data.errors) {
          throw new ApiError(
            Object.values(data.errors).join(", "),
            status,
            data.errors
          );
        } else if (data.message) {
          throw new ApiError(data.message, status);
        }
      }

      // Autres erreurs HTTP
      throw new ApiError(
        axiosError.response.statusText || "Erreur avec les données",
        status
      );
    }

    // Erreurs réseau
    throw new ApiError(
      "Impossible de se connecter au serveur. Veuillez vérifier votre connexion.",
      0
    );
  }

  // Erreurs non-Axios
  if (error instanceof Error) {
    throw new ApiError(error.message, 0);
  }

  throw new ApiError("Une erreur inconnue est survenue", 0);
};
