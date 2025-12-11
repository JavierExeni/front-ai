import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ICompany, UpdateCompanyPayload } from '../models/company';

/**
 * Service to manage company operations
 */
@Injectable({
  providedIn: 'root'
})
export class CompanyApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/company`;

  /**
   * Get company by ID
   * GET /company/{companyId}/
   */
  getCompany(companyId: number): Observable<ICompany> {
    return this.http.get<ICompany>(`${this.API_URL}/${companyId}/`);
  }

  /**
   * Update company information
   * PATCH /company/{companyId}/
   * Payload: name, size, website, headquarters
   */
  updateCompany(companyId: number, payload: UpdateCompanyPayload): Observable<ICompany> {
    return this.http.patch<ICompany>(`${this.API_URL}/${companyId}/`, payload);
  }

  /**
   * Delete company
   * DELETE /company/{companyId}/
   */
  deleteCompany(companyId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${companyId}/`);
  }
}
