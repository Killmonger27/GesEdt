import { handleApiError } from "../lib/handleApiError";
import axiosInstance from "../lib/axiosInstance";
import {
  UserData,
  UserDetailsUpdate,
  UserPasswordUpdate,
  UserPasswordUpdateResponse,
} from "../interfaces/Profile";

// Services pour les appels API
export const getUserProfile = async (): Promise<UserData> => {
  try {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// La modification du profil utilisateur nes pas être implémentée pour le moment
// L'id de l'utilisateur devra être récupéré depuis le token ce qui n'est pas encore fait
export const updateUserProfile = async (
  userData: UserDetailsUpdate
): Promise<UserData> => {
  try {
    const response = await axiosInstance.put(`/users/`, userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updatePassword = async (
  passwordData: UserPasswordUpdate
): Promise<UserPasswordUpdateResponse> => {
  try {
    const response = await axiosInstance.put("/users/password", passwordData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
