import axios from "axios";
import { UserData } from "../interfaces/Profile";
import { RegisterRequest } from "../interfaces/Authentification";
import { handleApiError } from "../lib/handleApiError";
import axiosInstance from "../lib/axiosInstance";

// Base URL pour les API d'utilisateurs - à ajuster selon votre configuration
const API_BASE_URL = "/api/utilisateurs";

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
 * Récupère un utilisateur par son ID
 * @param id ID de l'utilisateur
 * @returns Promise<UserData> Données de l'utilisateur
 */
export const getUtilisateurById = async (id: string): Promise<UserData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
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
 * Met à jour un utilisateur existant
 * @param id ID de l'utilisateur à mettre à jour
 * @param utilisateur Nouvelles données de l'utilisateur
 * @returns Promise<UserData> Données de l'utilisateur mis à jour
 */
export const updateUtilisateur = async (
  id: string,
  utilisateur: Partial<RegisterRequest>
): Promise<UserData> => {
  try {
    // Si le mot de passe est vide, on le supprime de l'objet pour ne pas l'envoyer
    if (utilisateur.password === "") {
      delete utilisateur.password;
    }

    const response = await axiosInstance.put(`/admin/users/${id}`, utilisateur);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime un utilisateur
 * @param id ID de l'utilisateur à supprimer
 * @returns Promise<void>
 */
export const deleteUtilisateur = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
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
 * Désactive un compte utilisateur
 * @param id ID de l'utilisateur à désactiver
 * @returns Promise<UserData> Données de l'utilisateur après désactivation
 */
export const desActivateUtilisateur = async (id: string): Promise<UserData> => {
  try {
    const response = await axios.put(`/admin/users/${id}/block`);
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
    const response = await axios.put(`/admin/users/${id}/block`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Débloque un compte utilisateur
 * @param id ID de l'utilisateur à débloquer
 * @returns Promise<UserData> Données de l'utilisateur après déblocage
 */
export const unblockUtilisateur = async (id: string): Promise<UserData> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/unblock`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Réinitialise le mot de passe d'un utilisateur
 * @param id ID de l'utilisateur
 * @returns Promise<{ message: string }> Message de confirmation
 */
export const resetPassword = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${id}/reset-password`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Change le rôle d'un utilisateur
 * @param id ID de l'utilisateur
 * @param role Nouveau rôle
 * @returns Promise<UserData> Données de l'utilisateur après changement de rôle
 */
export const changeRole = async (
  id: string,
  role: RegisterRequest["role"]
): Promise<UserData> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/role`, { role });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
