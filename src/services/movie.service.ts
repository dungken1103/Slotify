import { api } from "../middlewares/interceptors";
import type { MovieResponse } from "../types/movie";
import type { ApiResponse } from "../types/api";

export const movieService = {
  async getAllMovies(activeOnly: boolean = false) {
    const res = await api.get<ApiResponse<MovieResponse[]>>(`/Movie?activeOnly=${activeOnly}`);
    return res.data.data;
  },

  async getMovieById(id: string) {
    const res = await api.get<ApiResponse<MovieResponse>>(`/Movie/${id}`);
    return res.data.data;
  },

  async addMovie(data: any) {
    const res = await api.post<ApiResponse<MovieResponse>>("/Movie", data);
    return res.data;
  },

  async updateMovie(id: string, data: any) {
    const res = await api.put<ApiResponse<MovieResponse>>(`/Movie/${id}`, data);
    return res.data;
  },

  async deleteMovie(id: string) {
    const res = await api.delete<ApiResponse<any>>(`/Movie/${id}`);
    return res.data;
  },

  async activateMovie(id: string) {
    const res = await api.put<ApiResponse<any>>(`/Movie/${id}/activate`);
    return res.data;
  },

  async deactivateMovie(id: string) {
    const res = await api.put<ApiResponse<any>>(`/Movie/${id}/deactivate`);
    return res.data;
  }
};