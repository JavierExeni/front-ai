import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubscriptionPlan } from '../models/subscription-plan';
import { environment } from '../../../environments/environment.development';

export interface SubscribeRequest {
  user: string;
  subscription_plan: string;
}

export interface SubscribeResponse {
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionPlansApi {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;

  /**
   * Get all subscription plans
   */
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.API_URL}/subscription-plans/`);
  }

  /**
   * Subscribe user to a plan
   * @param userId - The user ID
   * @param planId - The subscription plan ID
   * @returns Observable with the Stripe checkout URL
   */
  subscribe(userId: number, planId: number): Observable<SubscribeResponse> {
    const payload: SubscribeRequest = {
      user: userId.toString(),
      subscription_plan: planId.toString(),
    };

    return this.http.post<SubscribeResponse>(`${this.API_URL}/subscribe/`, payload);
  }
}
