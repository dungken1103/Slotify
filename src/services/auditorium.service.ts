import { api } from '../middlewares/interceptors';
import type { ApiResponse } from '../types/api';

export interface Auditorium {
    id: string;
    name: string;
    cinemaId: string;
    cinemaName?: string;
    isActive: boolean;
    totalSeats?: number;
}

export interface AuditoriumRequest {
    name: string;
    cinemaId: string;
    isActive: boolean;
}

export const AuditoriumService = {
    getByCinema: async (cinemaId: string, includeInactive = false) => {
        const response = await api.get<ApiResponse<Auditorium[]>>(`/Auditorium/cinema/${cinemaId}?includeInactive=${includeInactive}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<ApiResponse<Auditorium>>(`/Auditorium/${id}`);
        return response.data;
    },

    create: async (data: AuditoriumRequest) => {
        const response = await api.post<ApiResponse<Auditorium>>('/Auditorium', data);
        return response.data;
    },

    update: async (id: string, data: AuditoriumRequest) => {
        const response = await api.put<ApiResponse<Auditorium>>(`/Auditorium/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete<ApiResponse<null>>(`/Auditorium/${id}`);
        return response.data;
    },

    activate: async (id: string) => {
        const response = await api.put<ApiResponse<null>>(`/Auditorium/${id}/activate`);
        return response.data;
    },

    deactivate: async (id: string) => {
        const response = await api.put<ApiResponse<null>>(`/Auditorium/${id}/deactivate`);
        return response.data;
    }
};
