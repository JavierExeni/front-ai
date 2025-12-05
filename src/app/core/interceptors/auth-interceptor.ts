import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const httpBackend = inject(HttpBackend);
  // Create HttpClient without interceptors using HttpBackend
  const http = new HttpClient(httpBackend);

  // Skip adding auth header for login and refresh endpoints
  const isAuthEndpoint = req.url.includes('/auth/user/login/') || req.url.includes('/auth/user/refresh/');

  if (isAuthEndpoint) {
    return next(req);
  }

  // Get access token from localStorage
  const accessToken = localStorage.getItem(TOKEN_KEY);

  // Clone request and add Authorization header if token exists
  let authReq = req;
  if (accessToken) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
    });
  }

  // Handle the request and catch 401 errors for token refresh
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 error and we have a refresh token, try to refresh
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (error.status === 401 && refreshToken) {
        return http.post<{ access: string; refresh: string }>(
          `${environment.apiUrl}/auth/user/refresh/`,
          { refresh: refreshToken }
        ).pipe(
          switchMap((tokenResponse) => {
            // Save new tokens
            localStorage.setItem(TOKEN_KEY, tokenResponse.access);
            if (tokenResponse.refresh) {
              localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh);
            }

            // Retry the original request with new access token
            const newAuthReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${tokenResponse.access}`),
            });
            return next(newAuthReq);
          }),
          catchError((refreshError) => {
            // If refresh fails, clear tokens and redirect to login
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // For other errors, just pass them through
      return throwError(() => error);
    })
  );
};
