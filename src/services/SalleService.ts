import axiosInstance from "../lib/axiosInstance";
import {
  Salle,
  SalleCreationPayload,
  SalleUpdatePayload,
} from "../interfaces/Salle";
import { handleApiError } from "../lib/handleApiError";

/**
 * Récupère toutes les salles
 * @returns Liste des salles
 */
export const getSalles = async (): Promise<Salle[]> => {
  try {
    const response = await axiosInstance.get("/salle");
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
    const response = await axiosInstance.get(`/salle/${id}`);
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
    const response = await axiosInstance.post("/salle", salle);
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
    const response = await axiosInstance.put(`/salle/${id}`, salle);
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
    await axiosInstance.delete(`/salle/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};
