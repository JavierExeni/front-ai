import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ICountry } from '../models/user';

/**
 * Service to fetch countries from the backend API
 */
@Injectable({
  providedIn: 'root'
})
export class CountriesApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/parameters/countries`;

  // Cache countries in a signal
  private _countries = signal<ICountry[]>([]);
  readonly countries = this._countries.asReadonly();

  /**
   * Fetch countries from the backend
   */
  fetchCountries(): Observable<ICountry[]> {
    return this.http.get<ICountry[]>(`${this.API_URL}/`).pipe(
      tap(countries => {
        this._countries.set(countries);
      })
    );
  }

  /**
   * Get a country by ID
   */
  getCountryById(id: number): ICountry | undefined {
    return this._countries().find(c => c.id === id);
  }

  /**
   * Get a country by code
   */
  getCountryByCode(code: string): ICountry | undefined {
    return this._countries().find(c => c.code === code);
  }
}
