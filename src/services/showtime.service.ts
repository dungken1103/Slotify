import { api } from '../middlewares/interceptors';

export interface Showtime {
    id: string;
    startTime: string;
    endTime: string;
    standardPrice: number;
    vipPrice: number;
    couplePrice: number;
    movieId: string;
    movieTitle: string;
    moviePosterUrl?: string;
    auditoriumId: string;
    auditoriumName: string;
    cinemaId: string;
    cinemaName: string;
}

export interface ShowtimeRequest {
    startTime: string;
    endTime: string;
    standardPrice: number;
    vipPrice: number;
    couplePrice: number;
    movieId: string;
    auditoriumId: string;
}

export const ShowtimeService = {
    getAll: async (fromDate?: string, toDate?: string) => {
        let url = '/Showtime';
        const params = new URLSearchParams();
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await api.get(url);
        return response.data;
    },

    getByMovie: async (movieId: string) => {
        const response = await api.get(`/Showtime/movie/${movieId}`);
        return response.data;
    },

    getByCinema: async (cinemaId: string) => {
        const response = await api.get(`/Showtime/cinema/${cinemaId}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/Showtime/${id}`);
        return response.data;
    },

    create: async (data: ShowtimeRequest) => {
        const response = await api.post('/Showtime', data);
        return response.data;
    },

    update: async (id: string, data: ShowtimeRequest) => {
        const response = await api.put(`/Showtime/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/Showtime/${id}`);
        return response.data;
    }
};
