import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ICampaign, IPaginate, CAMPAIGN_TYPE } from '../models/campaign';

/**
 * Service to manage campaign operations
 */
@Injectable({
  providedIn: 'root'
})
export class CampaignsApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  /**
   * Get paginated campaigns for a company
   * GET /company/{companyId}/campaign/?page={page}&page_size={pageSize}&campaign_type={campaignType}
   */
  getCampaigns(
    companyId: number,
    page: number = 1,
    pageSize: number = 10,
    campaignType?: CAMPAIGN_TYPE
  ): Observable<IPaginate<ICampaign>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (campaignType) {
      params = params.set('campaign_type', campaignType);
    }

    return this.http.get<IPaginate<ICampaign>>(
      `${this.API_URL}/company/${companyId}/campaign/`,
      { params }
    );
  }

  /**
   * Get a single campaign by ID
   * GET /company/{companyId}/campaign/{campaignId}/
   */
  getCampaign(companyId: number, campaignId: number): Observable<ICampaign> {
    return this.http.get<ICampaign>(
      `${this.API_URL}/company/${companyId}/campaign/${campaignId}/`
    );
  }

  /**
   * Create a new campaign
   * POST /company/{companyId}/campaign/
   */
  createCampaign(companyId: number, campaign: Partial<ICampaign>): Observable<ICampaign> {
    return this.http.post<ICampaign>(
      `${this.API_URL}/company/${companyId}/campaign/`,
      campaign
    );
  }

  /**
   * Update an existing campaign
   * PATCH /company/{companyId}/campaign/{campaignId}/
   */
  updateCampaign(
    companyId: number,
    campaignId: number,
    campaign: Partial<ICampaign>
  ): Observable<ICampaign> {
    return this.http.patch<ICampaign>(
      `${this.API_URL}/company/${companyId}/campaign/${campaignId}/`,
      campaign
    );
  }

  /**
   * Delete a campaign
   * DELETE /company/{companyId}/campaign/{campaignId}/
   */
  deleteCampaign(companyId: number, campaignId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/company/${companyId}/campaign/${campaignId}/`
    );
  }
}
