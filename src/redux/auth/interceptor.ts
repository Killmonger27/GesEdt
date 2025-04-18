import axios from "axios";
import { store } from "../auth/store";
import { refreshToken, logout } from "../auth/authSlice";

// Intercepteur pour gérer le rafraîchissement automatique du token
export const setupAuthInterceptor = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      // Si l'erreur est 401 (Non autorisé) et que la requête n'est pas déjà en train d'être réessayée
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const state = store.getState();
        const refreshTokenValue = state.auth.refreshToken;

        if (refreshTokenValue) {
          try {
            // Tenter de rafraîchir le token
            await store.dispatch(refreshToken(refreshTokenValue));

            // Mettre à jour le token dans la requête
            const newToken = store.getState().auth.token;
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            // Réessayer la requête originale
            return axios(originalRequest);
          } catch (refreshError) {
            // Si le rafraîchissement échoue, déconnecter l'utilisateur
            await store.dispatch(logout({ refreshToken: refreshTokenValue }));
            return Promise.reject(refreshError);
          }
        } else {
          // Pas de refreshToken disponible
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );
};
