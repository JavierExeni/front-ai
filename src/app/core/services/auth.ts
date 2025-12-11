import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  LoginCredentials,
  LoginResponse,
  TokenResponse,
  User,
  GoogleAuthRequest,
} from '../models/user';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = `${environment.apiUrl}/auth/user`;
  private readonly GOOGLE_AUTH_URL = `${environment.apiUrl}/auth/company/google`;
  private readonly USERS_API_URL = `${environment.apiUrl}/users`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly AUTH_RESPONSE = 'auth_response';

  // Signal to hold the current authenticated user
  user = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  currentUser = computed(() =>{
    return this.user() ?? this.getAuthResponse();
  });

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
      // Load user data automatically on app startup
      this.loadCurrentUser().subscribe({
        error: (error) => {
          console.error('Failed to load user on startup:', error);
          // If token is invalid or expired, logout
          this.logout(false);
        },
      });
    } else {
      // Ensure state is clean if no token
      this.user.set(null);
      this.isAuthenticated.set(false);
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login/`, credentials).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
      })
    );
  }

  /**
   * Login with Google using the id_token
   * @param idToken - The JWT credential from Google Identity Services
   */
  loginWithGoogle(idToken: string): Observable<LoginResponse> {
    const payload: GoogleAuthRequest = {
      access_token: idToken,
    };

    return this.http.post<LoginResponse>(`${this.GOOGLE_AUTH_URL}/`, payload).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
      })
    );
  }

  /**
   * Decode JWT token and extract user_id
   */
  private decodeToken(token: string): { user_id?: number } | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get user ID from current token
   */
  private getUserIdFromToken(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.user_id || null;
  }

  /**
   * Load current user data from backend
   */
  loadCurrentUser(): Observable<User> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      throw new Error('No user ID found in token');
    }

    return this.http.get<User>(`${this.USERS_API_URL}/${userId}/`).pipe(
      tap((user) => {
        this.isAuthenticated.set(true);
      })
    );
  }

  /**
   * Handle successful authentication (common logic for regular and Google login)
   */
  private handleAuthSuccess(response: LoginResponse): void {
    // Store tokens
    this.setAccessToken(response.access);
    this.setRefreshToken(response.refresh);
    this.setAuthResponse(response);

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
      company_id: response.company_id,
      subscription: response.subscription,
      is_skip_twilio_credentials: response.is_skip_twilio_credentials,
      is_skip_invite_members: response.is_skip_invite_members,
    };
    this.setAuthResponse(user);
    this.user.set(user);
    this.isAuthenticated.set(true);
  }

  /**
   * Logout user and clear stored data
   */
  logout(navigate: boolean = true): void {
    this.clearTokens();
    this.user.set(null);
    this.isAuthenticated.set(false);

    if (navigate) {
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Clear tokens only (used by interceptor to avoid circular dependencies)
   */
  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.AUTH_RESPONSE);
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<TokenResponse>(`${this.API_URL}/refresh/`, { refresh: refreshToken })
      .pipe(
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
   * Get auth response from storage
   */
  getAuthResponse(): User {
    return JSON.parse(localStorage.getItem(this.AUTH_RESPONSE)!);
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
   * Set auth response in storage
   */
  private setAuthResponse(response: User): void {
    localStorage.setItem(this.AUTH_RESPONSE, JSON.stringify(response));
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }
}
