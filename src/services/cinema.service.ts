import { api } from '../middlewares/interceptors';

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
        const response = await api.get(`/Cinema?includeInactive=${includeInactive}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/Cinema/${id}`);
        return response.data;
    },

    create: async (data: CinemaRequest) => {
        const response = await api.post('/Cinema', data);
        return response.data;
    },

    update: async (id: string, data: CinemaRequest) => {
        const response = await api.put(`/Cinema/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/Cinema/${id}`);
        return response.data;
    },

    activate: async (id: string) => {
        const response = await api.put(`/Cinema/${id}/activate`);
        return response.data;
    },

    deactivate: async (id: string) => {
        const response = await api.put(`/Cinema/${id}/deactivate`);
        return response.data;
    }
};
