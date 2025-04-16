import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { MovieResponse } from '../models/movie-response.model';
import { AuthService } from '../../auth/auth.service';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private baseUrl = 'http://localhost:9012/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  addMovie(imdbId: string, apiKey: string): Observable<MovieResponse> {
    return this.http.post<MovieResponse>(
      `${this.baseUrl}/admin/movie/add`,
      { imdbId, apiKey },
      { 
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    );
  }

  deleteMovie(movieId: number): Observable<MovieResponse> {
    return this.http.delete<MovieResponse>(
      `${this.baseUrl}/admin/movie/delete/${movieId}`,
      { 
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    );
  }

  getAllMovies(): Observable<Movie[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/user/movie/getAll`, { headers }).pipe(
      map((apiMovies: any[]) => {
        // Transform API response to match Movie interface
        const transformedMovies = apiMovies
          .filter(movie => movie.Response === "True" && movie.Title && movie.Year)
          .map(movie => ({
            id: movie.id,
            title: movie.Title,
            year: movie.Year,
            rated: movie.Rated,
            released: movie.Released,
            runtime: movie.Runtime,
            genre: movie.Genre,
            director: movie.Director,
            writer: movie.Writer,
            actors: movie.Actors,
            plot: movie.Plot,
            language: movie.Language,
            country: movie.Country,
            poster: movie.Poster,
            imdbRating: movie.ImdbRating,
            imdbID: movie.ImdbID,
            response: movie.Response
          }));

        // Remove duplicates based on title and year
        const uniqueMovies = transformedMovies.reduce((acc: Movie[], current: Movie) => {
          const exists = acc.find(movie => 
            movie.title === current.title && 
            movie.year === current.year
          );
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        return uniqueMovies;
      }),
      catchError(this.handleError)
    );
  }

  getMovieById(id: number): Observable<MovieResponse> {
    return this.http.get<any>(`${this.baseUrl}/user/movie/getById?i=${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.Response === "True") {
          const movie: Movie = {
            id: id,
            title: response.Title,
            year: response.Year,
            rated: response.Rated,
            released: response.Released,
            runtime: response.Runtime,
            genre: response.Genre,
            director: response.Director,
            writer: response.Writer,
            actors: response.Actors,
            plot: response.Plot,
            language: response.Language,
            country: response.Country,
            poster: response.Poster,
            imdbRating: response.ImdbRating,
            imdbID: response.ImdbID
          };
          return { success: true, movie: movie };
        } else {
          return { success: false, message: 'Movie not found' };
        }
      })
    );
  }

  getAllUsers(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/auth/get-users`,
      { headers: this.getAuthHeaders() }
    );
  }

  private handleError(error: any) {
    console.error('Error in getAllMovies:', error);
    return throwError('Something went wrong');
  }
}
