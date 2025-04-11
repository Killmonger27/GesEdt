import axios from "axios";
import {
  Salle,
  SalleCreationPayload,
  SalleUpdatePayload,
} from "../interfaces/Salle";
import { handleApiError } from "../lib/handleApiError";

const API_URL = "http://localhost:8086/api/salle";

// Instance axios avec configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Timeout de 10 secondes
});

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
