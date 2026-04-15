import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // Si el token expiró, intentar refrescar
    if (error.response?.status === 401 && originalRequest) {
      const { refreshToken, clearAuth } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { token } = response.data;
          useAuthStore.getState().setAuth(
            token,
            refreshToken,
            useAuthStore.getState().userId!,
            useAuthStore.getState().email!,
            useAuthStore.getState().hasProfile
          );

          // Reintentar la petición original
          originalRequest.headers!.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch {
          clearAuth();
          window.location.href = '/login';
        }
      } else {
        clearAuth();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.error || apiError?.message || 'Ocurrió un error inesperado';
  }
  return 'Ocurrió un error inesperado';
};
