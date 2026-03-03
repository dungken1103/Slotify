import axios from "axios";
import type { MovieResponse } from "../types/movie";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/Movie`;

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export const movieService = {
  async getAllMovies() {
    const res = await axios.get<ApiResponse<MovieResponse[]>>(API_URL);
    return res.data.data;
  },

  async getMovieById(id: string) {
    const res = await axios.get<ApiResponse<MovieResponse>>(`${API_URL}/${id}`);
    return res.data.data;
  }
};