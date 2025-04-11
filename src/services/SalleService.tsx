import axios, { AxiosError } from "axios";
import {
  Salle,
  SalleCreationPayload,
  SalleUpdatePayload,
  ValidationError,
} from "../interfaces/Salle";

const API_URL = "http://localhost:8086/api/salle";

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

// Instance axios avec configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Timeout de 10 secondes
});

// Fonction utilitaire pour gérer les erreurs
const handleApiError = (error: unknown): never => {
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
        axiosError.response.statusText || "Erreur serveur",
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

/**
 * Récupère toutes les salles
 * @returns Liste des salles
 */
export const getSalles = async (): Promise<Salle[]> => {
  try {
    const response = await api.get("");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère une salle par son ID
 * @param id Identifiant de la salle
 * @returns Détails de la salle
 */
export const getSalleById = async (id: string): Promise<Salle> => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée une nouvelle salle
 * @param salle Données de la salle à créer
 * @returns Salle créée avec son ID
 */
export const createSalle = async (
  salle: SalleCreationPayload
): Promise<Salle> => {
  try {
    const response = await api.post("", salle);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Met à jour une salle existante
 * @param id Identifiant de la salle
 * @param salle Données à mettre à jour
 * @returns Salle mise à jour
 */
export const updateSalle = async (
  id: string,
  salle: SalleUpdatePayload
): Promise<Salle> => {
  try {
    const response = await api.put(`/${id}`, salle);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime une salle
 * @param id Identifiant de la salle à supprimer
 */
export const deleteSalle = async (id: string): Promise<void> => {
  try {
    await api.delete(`/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};
