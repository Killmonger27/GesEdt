import axios from "axios";

const API_URL = "http://localhost:8086/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// intercepteur pour injecter dynamiquement le token à chaque requête
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

export default axiosInstance;
