import { api } from '../middlewares/interceptors';

export interface User {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    isActive: boolean;
    role: string;
    avatarUrl: string;
    createdAt: string;
}

export const UserService = {
    getAll: async () => {
        const response = await api.get('/User');
        return response.data;
    },

    changeRole: async (id: string, newRole: string) => {
        const response = await api.put(`/User/${id}/role`, { role: newRole });
        return response.data;
    }
};
