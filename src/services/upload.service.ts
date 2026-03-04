import { api } from '../middlewares/interceptors';
import type { ApiResponse } from '../types/api';

export const UploadService = {
    uploadImage: async (file: File): Promise<ApiResponse<string>> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<ApiResponse<string>>('/Upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    removeImage: async (url: string): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/Upload/image?url=${encodeURIComponent(url)}`);
        return response.data;
    }
};
