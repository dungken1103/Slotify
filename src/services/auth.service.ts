import { api } from '../middlewares/interceptors';
import type { ApiResponse } from '../types/api';
import type {
    LoginFormData,
    RegisterFormData,
    LoginResponse,
    User,
    ChangePasswordFormData,
    ForgotPasswordFormData,
    ResetPasswordFormData,
    UpdateProfileFormData
} from '../types/auth';

export const AuthService = {
    // Authentication
    login: async (data: LoginFormData): Promise<ApiResponse<LoginResponse>> => {
        const response = await api.post<ApiResponse<LoginResponse>>('/Auth/login', data);
        return response.data;
    },

    register: async (data: RegisterFormData): Promise<ApiResponse<User>> => {
        // Exclude confirmPassword before sending to backend
        const { confirmPassword, ...registerRequest } = data;
        const response = await api.post<ApiResponse<User>>('/Auth/register', registerRequest);
        return response.data;
    },

    googleLogin: async (idToken: string): Promise<ApiResponse<LoginResponse>> => {
        const response = await api.post<ApiResponse<LoginResponse>>('/Auth/google-login', { idToken });
        return response.data;
    },

    logout: async (): Promise<ApiResponse<void>> => {
        const response = await api.post<ApiResponse<void>>('/Auth/revoke');
        return response.data;
    },

    // Profile Management
    getMe: async (): Promise<ApiResponse<User>> => {
        const response = await api.get<ApiResponse<User>>('/Auth/me');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileFormData): Promise<ApiResponse<User>> => {
        const response = await api.put<ApiResponse<User>>('/Auth/profile', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordFormData): Promise<ApiResponse<void>> => {
        // Exclude confirmNewPassword before sending
        const { confirmNewPassword, ...changeRequest } = data;
        const response = await api.post<ApiResponse<void>>('/Auth/change-password', changeRequest);
        return response.data;
    },

    // Password Recovery
    forgotPassword: async (data: ForgotPasswordFormData): Promise<ApiResponse<void>> => {
        const response = await api.post<ApiResponse<void>>('/Auth/forgot-password', data);
        return response.data;
    },

    resetPassword: async (data: ResetPasswordFormData & { token: string }): Promise<ApiResponse<void>> => {
        const { confirmPassword, ...resetRequest } = data;
        const response = await api.post<ApiResponse<void>>('/Auth/reset-password', resetRequest);
        return response.data;
    }
};
