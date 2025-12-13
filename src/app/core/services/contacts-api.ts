import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact, ContactsResponse } from '../models/contact';
import { environment } from '../../../environments/environment.development';

export interface GetContactsParams {
  page?: number;
  page_size?: number;
  company?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ContactsApi {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/company`;

  /**
   * Get contacts for a company with pagination
   * @param companyId - The company ID
   * @param params - Query parameters for pagination and filtering
   * @returns Observable with the contacts response
   */
  getContacts(companyId: number, params?: GetContactsParams): Observable<ContactsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.page_size) {
      queryParams.append('page_size', params.page_size.toString());
    }
    if (params?.company) {
      queryParams.append('company', params.company.toString());
    }

    const queryString = queryParams.toString();
    const url = `${this.API_URL}/${companyId}/contacts/${queryString ? '?' + queryString : ''}`;

    return this.http.get<ContactsResponse>(url);
  }

  /**
   * Get a single contact by ID
   * @param companyId - The company ID
   * @param contactId - The contact ID
   * @returns Observable with the contact
   */
  getContact(companyId: number, contactId: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.API_URL}/${companyId}/contacts/${contactId}/`);
  }

  /**
   * Create a new contact
   * @param companyId - The company ID
   * @param data - Contact data
   * @returns Observable with the created contact
   */
  createContact(companyId: number, data: Partial<Contact>): Observable<Contact> {
    return this.http.post<Contact>(`${this.API_URL}/${companyId}/contacts/`, data);
  }

  /**
   * Update an existing contact
   * @param companyId - The company ID
   * @param contactId - The contact ID
   * @param data - Updated contact data
   * @returns Observable with the updated contact
   */
  updateContact(companyId: number, contactId: number, data: Partial<Contact>): Observable<Contact> {
    return this.http.patch<Contact>(`${this.API_URL}/${companyId}/contacts/${contactId}/`, data);
  }

  /**
   * Delete a contact
   * @param companyId - The company ID
   * @param contactId - The contact ID
   * @returns Observable with the deletion response
   */
  deleteContact(companyId: number, contactId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${companyId}/contacts/${contactId}/`);
  }
}
