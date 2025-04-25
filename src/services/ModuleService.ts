import {
  Module,
  ModuleCreationPayload,
  ModuleUpdatePayload,
} from "../interfaces/Module";
import { handleApiError } from "../lib/handleApiError";
import axiosInstance from "../lib/axiosInstance";
import axios from "axios";
import { UserData } from "../interfaces/Profile";

/**
 * Récupère tous les modules
 * @returns Liste des modules
 */
export const getModules = async (): Promise<Module[]> => {
  try {
    const response = await axiosInstance.get("/matiere");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère un module par son ID
 * @param id Identifiant du module
 * @returns Détails du module
 */
export const getModuleById = async (id: string): Promise<Module> => {
  try {
    const response = await axiosInstance.get(`matiere/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée un nouveau module
 * @param module Données du module à créer
 * @returns Module créé avec son ID
 */
export const createModule = async (
  module: ModuleCreationPayload
): Promise<Module> => {
  try {
    const response = await axiosInstance.post("/matiere", module);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Met à jour un module existant
 * @param id Identifiant du module
 * @param module Données à mettre à jour
 * @returns Module mis à jour
 */
export const updateModule = async (
  id: string,
  module: ModuleUpdatePayload
): Promise<Module> => {
  try {
    const response = await axios.put(`/matiere/${id}`, module);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime un module
 * @param id Identifiant du module à supprimer
 */
export const deleteModule = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/matiere/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère tous les modules associés à une filière
 * @param filiereId Identifiant de la filière
 * @returns Liste des modules de la filière
 */
export const getModulesByFiliere = async (
  filiereId: string
): Promise<Module[]> => {
  try {
    const response = await axiosInstance.get(`/matiere/filiere/${filiereId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère tous les modules assignés à un enseignant
 * @param enseignantId Identifiant de l'enseignant
 * @returns Liste des modules de l'enseignant
 */
export const getModulesByEnseignant = async (
  enseignantId: string
): Promise<Module[]> => {
  try {
    const response = await axiosInstance.get(
      `/matiere/enseignant/${enseignantId}`
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère les statistiques des modules par statut
 * @returns Statistiques des modules
 */
export const getModuleStats = async (): Promise<{
  total: number;
  nonDebutes: number;
  enCours: number;
  termines: number;
}> => {
  try {
    const response = await axiosInstance.get("/module/stats");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getEnseignants = async (): Promise<UserData[]> => {
  try {
    const response = await axiosInstance.get("/admin/users");
    response.data = response.data.filter(
      (user: UserData) => user.role === "ENSEIGNANT"
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
