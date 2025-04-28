import axiosInstance from "../lib/axiosInstance";
import { handleApiError } from "../lib/handleApiError";

import { Cours } from "../interfaces/EDT";

// Fonction pour récupérer les cours d'un EDT
export const getCoursByEdt = async (edtId: string): Promise<Cours[]> => {
  try {
    const response = await axiosInstance.get<Cours[]>(`/cours/${edtId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Fonction pour créer un cours
export const createCours = async (cours: Partial<Cours>): Promise<Cours> => {
  try {
    const response = await axiosInstance.post("/cours", cours);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Fonction pour mettre à jour un cours
export const updateCours = async (
  coursId: string,
  cours: Partial<Cours>
): Promise<Cours> => {
  try {
    const response = await axiosInstance.put(`/cours/${coursId}`, cours);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Fonction pour supprimer un cours
export const deleteCours = async (coursId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/cours/${coursId}`);
  } catch (error) {
    throw handleApiError(error);
  }
};
// Fonction pour récupérer un cours par son ID
export const getCoursById = async (coursId: string): Promise<Cours> => {
  try {
    const response = await axiosInstance.get<Cours>(`/cours/${coursId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
// Fonction pour récupérer les cours d'un EDT par son ID
export const getCoursByEdtId = async (edtId: string): Promise<Cours[]> => {
  try {
    const response = await axiosInstance.get<Cours[]>(`/cours/${edtId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
