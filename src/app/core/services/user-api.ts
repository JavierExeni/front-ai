import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { User } from '../models/user';

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  country?: number;
  phone?: string;
  otp_code?: string; // Required when updating phone number
}

export interface DeleteAccountPayload {
  user_id: number;
}

/**
 * Service to manage user profile operations
 */
@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;
  private readonly COMPANY_API_URL = `${environment.apiUrl}/company`;

  /**
   * Update user profile information
   */
  updateUser(userId: number, payload: UpdateUserPayload): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${userId}/`, payload);
  }

  /**
   * Delete user account
   */
  deleteAccount(payload: DeleteAccountPayload): Observable<void> {
    return this.http.post<void>(`${this.COMPANY_API_URL}/bulk-delete/`, payload);
  }
}
