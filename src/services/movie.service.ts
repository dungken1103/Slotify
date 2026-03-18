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
  }
};