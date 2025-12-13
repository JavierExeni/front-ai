import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CampaignAgent, VoiceAgent } from '../models/agent';
import { environment } from '../../../environments/environment.development';

export interface CreateCampaignAgentRequest {
  name: string;
  agent_title: string;
  agent: string;
}

@Injectable({
  providedIn: 'root',
})
export class VoiceAgentsApi {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/company`;

  /**
   * Get campaign agents for a company by agent type
   * @param companyId - The company ID
   * @param agentType - The agent type (voice, email, sms)
   * @returns Observable with the list of campaign agents
   */
  getCampaignAgents(companyId: number, agentType: 'voice' | 'email' | 'sms' = 'voice'): Observable<CampaignAgent[]> {
    return this.http.get<CampaignAgent[]>(
      `${this.API_URL}/${companyId}/campaign-agents/?agent_type=${agentType}`
    );
  }

  /**
   * Get voice agents for a company (legacy method)
   * @param companyId - The company ID
   * @returns Observable with the list of campaign agents
   */
  getVoiceAgents(companyId: number): Observable<CampaignAgent[]> {
    return this.getCampaignAgents(companyId, 'voice');
  }

  /**
   * Get available agents from the platform by type
   * @param agentType - The agent type (voice, email, sms)
   * @returns Observable with the list of available agents
   */
  getAvailableAgents(agentType: 'voice' | 'email' | 'sms' = 'voice'): Observable<VoiceAgent[]> {
    return this.http.get<VoiceAgent[]>(
      `${this.API_URL}/agents/?agent_type=${agentType}`
    );
  }

  /**
   * Get available voice agents (voices) from the platform (legacy method)
   * @returns Observable with the list of available voices
   */
  getAvailableVoices(): Observable<VoiceAgent[]> {
    return this.getAvailableAgents('voice');
  }

  /**
   * Create a new campaign agent
   * @param companyId - The company ID
   * @param data - Campaign agent data
   * @returns Observable with the created campaign agent
   */
  createCampaignAgent(companyId: number, data: CreateCampaignAgentRequest): Observable<CampaignAgent> {
    return this.http.post<CampaignAgent>(
      `${this.API_URL}/${companyId}/campaign-agents/`,
      data
    );
  }

  /**
   * Update a campaign agent
   * @param companyId - The company ID
   * @param agentId - The campaign agent ID
   * @param data - Updated campaign agent data
   * @returns Observable with the updated campaign agent
   */
  updateCampaignAgent(companyId: number, agentId: number, data: CreateCampaignAgentRequest): Observable<CampaignAgent> {
    return this.http.patch<CampaignAgent>(
      `${this.API_URL}/${companyId}/campaign-agents/${agentId}/`,
      data
    );
  }

  /**
   * Delete a campaign agent
   * @param companyId - The company ID
   * @param agentId - The campaign agent ID
   * @returns Observable with the deletion response
   */
  deleteCampaignAgent(companyId: number, agentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/${companyId}/campaign-agents/${agentId}/`
    );
  }
}
