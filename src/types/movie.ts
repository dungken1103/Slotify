export interface MovieResponse {
  id: string;
  title: string;
  description: string;
  director: string;
  cast: string;
  genre: string;
  durationMinutes: number;
  releaseDate: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  isActive: boolean;
}

export interface MovieRequest {
  title: string;
  description: string;
  director: string;
  cast: string;
  genre: string;
  durationMinutes: number;
  releaseDate: string;
  posterUrl: string;
  trailerUrl: string;
  isActive: boolean;
}