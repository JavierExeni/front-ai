import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginCredentials, LoginResponse, TokenResponse, User } from '../models/user';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = `${environment.apiUrl}/auth/user`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // Signal to hold the current authenticated user
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    // Initialize user from stored tokens on service creation
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from stored tokens
   */
  private initializeAuth(): void {
    const token = this.getAccessToken();
    if (token) {
      this.isAuthenticated.set(true);
      // Optionally fetch user data if token exists
      // You can add a method to fetch current user data from an endpoint
    } else {
      // Ensure state is clean if no token
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login/`, credentials).pipe(
      tap((response) => {
        // Store tokens
        this.setAccessToken(response.access);
        this.setRefreshToken(response.refresh);

        // Set current user (excluding tokens)
        const user: User = {
          id: response.id,
          email: response.email,
          first_name: response.first_name,
          last_name: response.last_name,
          is_active: response.is_active,
          avatar: response.avatar,
          created_at: response.created_at,
          updated_at: response.updated_at,
          email_verified: response.email_verified,
          phone: response.phone,
          has_company: response.has_company,
          platform_role: response.platform_role,
          country: response.country,
        };

        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  /**
   * Logout user and clear stored data
   */
  logout(navigate: boolean = true): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    if (navigate) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Clear tokens only (used by interceptor to avoid circular dependencies)
   */
  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<TokenResponse>(`${this.API_URL}/refresh/`, { refresh: refreshToken }).pipe(
      tap((response) => {
        this.setAccessToken(response.access);
        if (response.refresh) {
          this.setRefreshToken(response.refresh);
        }
      })
    );
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set access token in storage
   */
  private setAccessToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Set refresh token in storage
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }
}
