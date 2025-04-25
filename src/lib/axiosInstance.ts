import axios from "axios";

const API_URL = "http://localhost:8086/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Stockage des requêtes en attente de rafraîchissement du token
let isRefreshing = false;
interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Intercepteur pour injecter dynamiquement le token à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs et le rafraîchissement du token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Éviter les boucles infinies si le rafraîchissement échoue
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Cas d'un token expiré (403 Forbidden)
    if (error.response?.status === 403) {
      const refreshTokenValue = localStorage.getItem("refreshToken");

      if (!refreshTokenValue) {
        // Pas de refresh token disponible
        console.error("Aucun refresh token disponible");
        return Promise.reject(error);
      }

      // Si un rafraîchissement est déjà en cours, mettre la requête en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Marquer la requête originale comme étant en cours de retry
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Appel à l'API pour rafraîchir le token
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken: refreshTokenValue,
        });

        // Extraction et stockage du nouveau token
        const { token: newToken, refreshToken: newRefreshToken } =
          response.data;

        // Mise à jour du stockage local et du state Redux
        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Mise à jour de l'en-tête d'autorisation pour la requête originale
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Traitement des requêtes en attente
        processQueue(null, newToken);

        console.log("Token rafraîchi avec succès");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Échec du rafraîchissement du token
        console.error("Échec du rafraîchissement du token:", refreshError);
        processQueue(refreshError);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Cas d'un token invalide (401 Unauthorized)
    if (error.response?.status === 401) {
      console.log("Token invalide, déconnexion...");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
