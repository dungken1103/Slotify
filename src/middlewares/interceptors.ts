import axios from 'axios';
import { useAuthStore } from './useAuthStore';

// Get base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for sending/receiving HttpOnly cookies (refresh token)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach access token
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

// Response Interceptor: Handle 401 & Automatic Token Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401, not a retry attempt, and not the login/refresh endpoint itself
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('login') &&
            !originalRequest.url?.includes('refresh-token')
        ) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token using the HttpOnly cookie
                const response = await axios.post(`${API_BASE_URL}/Auth/refresh-token`, {}, {
                    withCredentials: true
                });

                if (response.data?.succeeded) {
                    const newToken = response.data.data.token;

                    // Update the zustand store with new token
                    useAuthStore.getState().setToken(newToken);

                    // Update auth header for the retry request
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token failed or expired -> forces a full logout
                useAuthStore.getState().clearAuth();
                window.location.href = '/login?expired=true';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
