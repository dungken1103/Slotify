import { api } from '../middlewares/interceptors';

export interface Seat {
    id: string;
    row: string;
    number: number;
    seatName?: string;
    type: string;
    auditoriumId: string;
    isActive: boolean;
}

export interface SeatRequest {
    row: string;
    number: number;
    type: number | string;
    auditoriumId: string;
    isActive: boolean;
}

export const SeatService = {
    getByAuditorium: async (auditoriumId: string, includeInactive = false) => {
        const response = await api.get(`/RoomSeat/auditorium/${auditoriumId}?includeInactive=${includeInactive}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/RoomSeat/${id}`);
        return response.data;
    },

    create: async (data: SeatRequest) => {
        const response = await api.post('/RoomSeat', data);
        return response.data;
    },

    createBulk: async (data: SeatRequest[]) => {
        const response = await api.post('/RoomSeat/bulk', data);
        return response.data;
    },

    update: async (id: string, data: SeatRequest) => {
        const response = await api.put(`/RoomSeat/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/RoomSeat/${id}`);
        return response.data;
    },

    activate: async (id: string) => {
        const response = await api.put(`/RoomSeat/${id}/activate`);
        return response.data;
    },

    deactivate: async (id: string) => {
        const response = await api.put(`/RoomSeat/${id}/deactivate`);
        return response.data;
    }
};
