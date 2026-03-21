import { api } from '../middlewares/interceptors';
import type { ApiResponse } from '../types/api';

export type SeatType = "Standard" | "VIP" | "Couple";

export const seatTypeToValue: Record<SeatType, number> = {
    Standard: 0,
    VIP: 1,
    Couple: 2,
};

export const seatValueToType = (value: number | string): SeatType => {
    if (value === 1 || value === "1" || value === "VIP") return "VIP";
    if (value === 2 || value === "2" || value === "Couple") return "Couple";
    return "Standard";
};

export interface Seat {
    id: string;
    row: string;
    number: number;
    seatName?: string;
    type: SeatType;
    auditoriumId: string;
    isActive: boolean;
}

export interface SeatRequest {
    row: string;
    number: number;
    type: number;
    auditoriumId: string;
    isActive: boolean;
}

export const SeatService = {
    getByAuditorium: async (auditoriumId: string, includeInactive = false) => {
        const response = await api.get<ApiResponse<Seat[]>>(`/RoomSeat/auditorium/${auditoriumId}?includeInactive=${includeInactive}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<ApiResponse<Seat>>(`/RoomSeat/${id}`);
        return response.data;
    },

    create: async (data: SeatRequest) => {
        const response = await api.post<ApiResponse<Seat>>('/RoomSeat', data);
        return response.data;
    },

    createBulk: async (data: SeatRequest[]) => {
        const response = await api.post<ApiResponse<Seat[]>>('/RoomSeat/bulk', data);
        return response.data;
    },

    update: async (id: string, data: SeatRequest) => {
        const response = await api.put<ApiResponse<Seat>>(`/RoomSeat/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete<ApiResponse<null>>(`/RoomSeat/${id}`);
        return response.data;
    },

    activate: async (id: string) => {
        const response = await api.put<ApiResponse<null>>(`/RoomSeat/${id}/activate`);
        return response.data;
    },

    deactivate: async (id: string) => {
        const response = await api.put<ApiResponse<null>>(`/RoomSeat/${id}/deactivate`);
        return response.data;
    }
};
