import axios from "axios";
import type { MovieResponse } from "../types/movie";
import type { ApiResponse } from "../types/api";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/Movie`;

export const movieService = {
  async getAllMovies(activeOnly: boolean = false) {
    const res = await axios.get<ApiResponse<MovieResponse[]>>(`${API_URL}?activeOnly=${activeOnly}`);
    return res.data.data;
  },

  async getMovieById(id: string) {
    const res = await axios.get<ApiResponse<MovieResponse>>(`${API_URL}/${id}`);
    return res.data.data;
  }
};