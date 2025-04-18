import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from './models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:9012/api/auth';

  constructor(private http: HttpClient) { }

  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROLE_KEY = 'user_role';

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  register(username: string, password: string, email: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/register`, {
      username,
      password,
      email
    }, {
      responseType: 'text',
      headers: this.getAuthHeaders()
    });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, {
      username,
      password
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.ROLE_KEY, response.role || 'USER');
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined') {
      const token = this.getToken();
      if (!token) return false;

      try {
        // Simple JWT expiration check
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // Convert to milliseconds
        return Date.now() < expiry;
      } catch {
        return false;
      }
    }
    return false;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-users`, {
      headers: this.getAuthHeaders()
    });
  }
}
