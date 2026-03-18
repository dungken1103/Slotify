export interface MovieResponse {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: string;
  releaseDate: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  rating: number;
}