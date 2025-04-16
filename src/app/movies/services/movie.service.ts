import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { MovieResponse } from '../models/movie-response.model';
import { AuthService } from '../../auth/auth.service';
import { map } from 'rxjs/operators';

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

  getAllMovies(): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/user/movie/getAll`,
      { 
        headers: this.getAuthHeaders()
      }
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
}
