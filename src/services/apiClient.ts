import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios';
import type { ApiErrorResponse } from '@shared/types/index.js';

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiClientCustomError {
  message: string;
  statusCode: number;
  errors: Array<{ field?: string; message: string; [key: string]: unknown }>;
}

/**
 * Centralized Axios instance for non-RTK Query requests (e.g. file uploads or standalone utilities)
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('devasetu_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Response interceptor: Uniform error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const customError: ApiClientCustomError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      errors: (error.response?.data?.errors as Array<{ field?: string; message: string; [key: string]: unknown }>) || [],
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
