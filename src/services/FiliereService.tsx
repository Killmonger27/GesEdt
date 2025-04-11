import axios from "axios";
import {
  Filiere,
  FiliereCreationPayload,
  FiliereUpdatePayload,
} from "../interfaces/Filiere";
import { handleApiError } from "../lib/handleApiError";

const API_URL = "http://localhost:8086/api/filiere";

// Instance axios avec configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Timeout de 10 secondes
});

/**
 * Récupère toutes les filières
 * @returns Liste des filières
 */
export const getFilieres = async (): Promise<Filiere[]> => {
  try {
    const response = await api.get("");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère une filière par son ID
 * @param id Identifiant de la filière
 * @returns Détails de la filière
 */
export const getFiliereById = async (id: string): Promise<Filiere> => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée une nouvelle filière
 * @param filiere Données de la filière à créer
 * @returns Filière créée avec son ID
 */
export const createFiliere = async (
  filiere: FiliereCreationPayload
): Promise<Filiere> => {
  try {
    const response = await api.post("", filiere);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Met à jour une filière existante
 * @param id Identifiant de la filière
 * @param filiere Données à mettre à jour
 * @returns Filière mise à jour
 */
export const updateFiliere = async (
  id: string,
  filiere: FiliereUpdatePayload
): Promise<Filiere> => {
  try {
    const response = await api.put(`/${id}`, filiere);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime une filière
 * @param id Identifiant de la filière à supprimer
 */
export const deleteFiliere = async (id: string): Promise<void> => {
  try {
    await api.delete(`/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};
