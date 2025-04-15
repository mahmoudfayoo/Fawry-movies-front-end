import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { MovieResponse } from '../models/movie-response.model';
import { AuthService } from '../../auth/auth.service';

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
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
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
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    );
  }

  getMovieById(id: number): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/user/movie/get/${id}`,
      { 
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    );
  }

  getAllUsers(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/auth/get-users`,
      { headers: this.getAuthHeaders() }
    );
  }
}
