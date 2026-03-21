import { api } from '../middlewares/interceptors';
import type { ApiResponse } from '../types/api';

export interface Cinema {
    id: string;
    name: string;
    address: string;
    city: string;
    isActive: boolean;
    numberOfAuditoriums: number;
}

export interface CinemaRequest {
    name: string;
    address: string;
    city: string;
    isActive: boolean;
}

export const CinemaService = {
    getAll: async (includeInactive = false) => {
        const response = await api.get<ApiResponse<Cinema[]>>(`/Cinema?includeInactive=${includeInactive}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<ApiResponse<Cinema>>(`/Cinema/${id}`);
        return response.data;
    },

    create: async (data: CinemaRequest) => {
        const response = await api.post<ApiResponse<Cinema>>('/Cinema', data);
        return response.data;
    },

    update: async (id: string, data: CinemaRequest) => {
        const response = await api.put<ApiResponse<Cinema>>(`/Cinema/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete<ApiResponse<null>>(`/Cinema/${id}`);
        return response.data;
    },

    activate: async (id: string) => {
        const response = await api.put<ApiResponse<null>>(`/Cinema/${id}/activate`);
        return response.data;
    },

    deactivate: async (id: string) => {
        const response = await api.put<ApiResponse<null>>(`/Cinema/${id}/deactivate`);
        return response.data;
    }
};
