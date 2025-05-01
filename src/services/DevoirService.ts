import axiosInstance from "../lib/axiosInstance";
import { handleApiError } from "../lib/handleApiError";

import { Devoir } from "../interfaces/EDT";

// Fonction pour récupérer les devoirs d'un EDT
export const getDevoirsByEdt = async (
  edtId: string,
  filiereId: string
): Promise<Devoir[]> => {
  try {
    const response = await axiosInstance.get<Devoir[]>(
      `/devoir/${edtId}/${filiereId}`
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Fonction pour créer un devoir
export const createDevoir = async (
  devoir: Partial<Devoir>
): Promise<Devoir> => {
  try {
    const response = await axiosInstance.post("/devoir", devoir);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Fonction pour mettre à jour un devoir
export const updateDevoir = async (
  devoirId: string,
  devoir: Partial<Devoir>
): Promise<Devoir> => {
  try {
    const response = await axiosInstance.put<Devoir>(
      `/devoirs/${devoirId}`,
      devoir
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Fonction pour supprimer un devoir
export const deleteDevoir = async (devoirId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/devoirs/${devoirId}`);
  } catch (error) {
    throw handleApiError(error);
  }
};
// Fonction pour récupérer un devoir par son ID
export const getDevoirById = async (devoirId: string): Promise<Devoir> => {
  try {
    const response = await axiosInstance.get<Devoir>(`/devoirs/${devoirId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
// Fonction pour récupérer les devoirs d'un EDT par son ID
export const getDevoirsByEdtId = async (edtId: string): Promise<Devoir[]> => {
  try {
    const response = await axiosInstance.get<Devoir[]>(`/devoirs/${edtId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
