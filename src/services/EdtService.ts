import { Edt } from "../interfaces/EDT";
import axiosInstance from "../lib/axiosInstance";
import { handleApiError } from "../lib/handleApiError";

/**
 * Recupere la liste de tous les emploi du temps
 * @return Liste des Edt
 */
export const getEdt = async (): Promise<Edt[]> => {
  try {
    const response = await axiosInstance.get("/edt");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Creer un Edt
 * @return Edt cree
 */
export const createEdt = async (edtData: Partial<Edt>): Promise<Edt> => {
  try {
    const response = await axiosInstance.post("/edt", edtData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprimer un edt
 * @param edtID
 */
export const deleteEdt = async (edtID: string) => {
  try {
    await axiosInstance.delete(`/edt/${edtID}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const publishEdt = async (edtID: string) => {
  try {
    await axiosInstance.patch(`/edt/${edtID}/publish`);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Clore un Edt
 * @param edtID
 */
export const closeEdt = async (edtID: string) => {
  try {
    await axiosInstance.patch(`/edt/${edtID}`);
  } catch (error) {
    throw handleApiError(error);
  }
};
