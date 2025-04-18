import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AuthState,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  LogoutRequest,
} from "../../interfaces/Authentification";
import axiosInstance from "../../lib/axiosInstance";
import axios from "axios";

// Configuration de base pour axios
// const API_URL = "http://localhost:8086/api/auth";
// axios.defaults.baseURL = API_URL;

// // Configuration initiale de axios avec le token
// const setAuthToken = (token: string | null) => {
//   if (token) {
//     axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//   } else {
//     delete axios.defaults.headers.common["Authorization"];
//   }
// };

// Thunks pour les actions asynchrones
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        "/auth/login",
        credentials
      );
      // Stocker le token dans le localStorage si besoin
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      // Définir le token pour les requêtes futures
      //setAuthToken(response.data.token);

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message || "Erreur de connexion"
        );
      }
      return rejectWithValue("Erreur de connexion");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    userData: RegisterRequest,
    { rejectWithValue }: { rejectWithValue: (value: string) => void }
  ) => {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        "/auth/register",
        userData
      );
      // Stocker le token dans le localStorage si besoin
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      // Définir le token pour les requêtes futures
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message || "Erreur d'inscription"
        );
      }
      return rejectWithValue("Erreur d'inscription");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (refreshTokenValue: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        "auth/refresh-token",
        {
          refreshToken: refreshTokenValue,
        }
      );
      localStorage.setItem("token", response.data.token);

      // Définir le token pour les requêtes futures
      //setAuthToken(response.data.token);

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message ||
            "Session expirée. Veuillez vous reconnecter."
        );
      }
      // Si le rafraîchissement du token échoue, nous déconnectons l'utilisateur
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      //setAuthToken(null);
      return rejectWithValue("Session expirée. Veuillez vous reconnecter.");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (logoutData: LogoutRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("auth/logout", logoutData);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      //setAuthToken(null);

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message || "Erreur lors de la déconnexion"
        );
      }
      // Même en cas d'erreur, nous supprimons les tokens locaux
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      //setAuthToken(null);

      return rejectWithValue(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
          "Erreur lors de la déconnexion"
      );
    }
  }
);

// État initial
const initialState: AuthState = {
  id: null,
  nom: null,
  prenom: null,
  type: null,
  email: null,
  statutCompte: null,
  roles: null,
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

// Récupérer le token au démarrage si disponible
// if (initialState.token) {
//   setAuthToken(initialState.token);
// }

// Slice Redux
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      login.fulfilled,
      (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.id = action.payload.id;
        state.nom = action.payload.nom;
        state.prenom = action.payload.prenom;
        state.type = action.payload.type;
        state.email = action.payload.email;
        state.statutCompte = action.payload.statutCompte;
        state.roles = action.payload.roles;
      }
    );
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    // En cas de succès, on peut aussi stocker le token et les infos utilisateur
    // dans le localStorage et mettre à jour l'état
    builder.addCase(
      register.fulfilled,
      (state, action: PayloadAction<AuthResponse | void>) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.id = action.payload.id;
          state.nom = action.payload.nom;
          state.prenom = action.payload.prenom;
          state.type = action.payload.type;
          state.email = action.payload.email;
          state.statutCompte = action.payload.statutCompte;
          state.roles = action.payload.roles;
        }
      }
    );
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Refresh Token
    builder.addCase(
      refreshToken.fulfilled,
      (state, action: PayloadAction<AuthResponse>) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
    );
    builder.addCase(refreshToken.rejected, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.id = null;
      state.nom = null;
      state.prenom = null;
      state.type = null;
      state.email = null;
      state.statutCompte = null;
      state.roles = null;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.id = null;
      state.statutCompte = null;
      state.roles = null;
      state.nom = null;
      state.prenom = null;
      state.type = null;
      state.email = null;
      state.error = null;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
export const selectAuth = (state: { auth: AuthState }) => state.auth;
