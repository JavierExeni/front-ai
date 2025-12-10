import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface RequestOtpPayload {
  email: string;
  type: 'email';
}

export interface RequestOtpResponse {
  message: string;
}

/**
 * Service to handle OTP requests and verification
 */
@Injectable({
  providedIn: 'root'
})
export class OtpApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  /**
   * Request OTP code to be sent to email
   */
  requestOtp(payload: RequestOtpPayload): Observable<RequestOtpResponse> {
    return this.http.post<RequestOtpResponse>(`${this.API_URL}/request-otp/`, payload);
  }
}
