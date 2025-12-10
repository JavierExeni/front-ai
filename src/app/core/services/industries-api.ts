import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

/**
 * Industry from backend API
 */
export interface IIndustry {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_active: boolean;
  name: string;
  icon: string;
}

/**
 * Service to fetch industries from the backend API
 */
@Injectable({
  providedIn: 'root'
})
export class IndustriesApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/company/industry`;

  // Cache industries in a signal
  private _industries = signal<IIndustry[]>([]);
  readonly industries = this._industries.asReadonly();

  /**
   * Fetch industries from the backend
   */
  fetchIndustries(): Observable<IIndustry[]> {
    return this.http.get<IIndustry[]>(`${this.API_URL}/`).pipe(
      tap(industries => {
        this._industries.set(industries);
      })
    );
  }

  /**
   * Get an industry by ID
   */
  getIndustryById(id: number): IIndustry | undefined {
    return this._industries().find(i => i.id === id);
  }
}
