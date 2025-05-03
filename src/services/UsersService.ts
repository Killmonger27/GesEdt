import { UserData } from "../interfaces/Profile";
import { RegisterRequest } from "../interfaces/Authentification";
import { handleApiError } from "../lib/handleApiError";
import axiosInstance from "../lib/axiosInstance";

/**
 * Récupère la liste de tous les utilisateurs
 * @returns Promise<UserData[]> Liste des utilisateurs
 */
export const getUtilisateurs = async (): Promise<UserData[]> => {
  try {
    const response = await axiosInstance.get("/admin/users");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée un nouvel utilisateur
 * @param utilisateur Données du nouvel utilisateur
 * @returns Promise<UserData> Données de l'utilisateur créé
 */
export const createUtilisateur = async (
  utilisateur: Partial<RegisterRequest>
): Promise<UserData> => {
  try {
    const response = await axiosInstance.post("/auth/register", utilisateur);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Active un compte utilisateur
 * @param id ID de l'utilisateur à activer
 * @returns Promise<UserData> Données de l'utilisateur après activation
 */
export const activateUtilisateur = async (id: string): Promise<UserData> => {
  try {
    const response = await axiosInstance.put(`/admin/users/${id}/activate`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Bloque un compte utilisateur
 * @param id ID de l'utilisateur à bloquer
 * @returns Promise<UserData> Données de l'utilisateur après blocage
 */
export const blockUtilisateur = async (id: string): Promise<UserData> => {
  try {
    const response = await axiosInstance.put(`/admin/users/${id}/block`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const promoteStudent = async (id: string): Promise<UserData> => {
  try {
    const response = await axiosInstance.post(`/${id}/nommerDelegue`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
