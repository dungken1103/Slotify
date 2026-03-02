import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    setToken: (token: string) => void;
    updateUser: (user: User) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user: User, token: string) =>
                set({ user, token, isAuthenticated: true }),

            setToken: (token: string) =>
                set((state) => ({ ...state, token })),

            updateUser: (user: User) =>
                set((state) => ({ ...state, user })),

            clearAuth: () =>
                set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage', // key in local storage
            // Only store the token and mostly static user data securely or let interceptors handle JWT
            // It's safer to just store token and re-fetch user, but we'll cache user for better UX
        }
    )
);
