import { Movie } from './movie.model';

export interface MovieResponse {
  movies?: Movie[];
  movie?: Movie;
  message?: string;
  success: boolean;
}
