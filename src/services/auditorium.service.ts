import { api } from '../middlewares/interceptors';

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
        const response = await api.get(`/Auditorium/cinema/${cinemaId}?includeInactive=${includeInactive}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/Auditorium/${id}`);
        return response.data;
    },

    create: async (data: AuditoriumRequest) => {
        const response = await api.post('/Auditorium', data);
        return response.data;
    },

    update: async (id: string, data: AuditoriumRequest) => {
        const response = await api.put(`/Auditorium/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/Auditorium/${id}`);
        return response.data;
    },

    activate: async (id: string) => {
        const response = await api.put(`/Auditorium/${id}/activate`);
        return response.data;
    },

    deactivate: async (id: string) => {
        const response = await api.put(`/Auditorium/${id}/deactivate`);
        return response.data;
    }
};
