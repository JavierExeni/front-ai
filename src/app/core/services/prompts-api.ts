import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prompt } from '../models/prompt';
import { environment } from '../../../environments/environment.development';

export interface CreatePromptRequest {
  agent_type: string;
  name: string;
  prompt: string;
  company: string;
}

@Injectable({
  providedIn: 'root',
})
export class PromptsApi {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/company/agent-prompts`;

  /**
   * Get prompts for a company
   * @param companyId - The company ID
   * @param agentType - The agent type (voice, email, sms)
   * @returns Observable with the list of prompts
   */
  getPrompts(companyId: number, agentType: string = 'voice'): Observable<Prompt[]> {
    return this.http.get<Prompt[]>(
      `${this.API_URL}/?agent_type=${agentType}&company=${companyId}`
    );
  }

  /**
   * Create a new prompt
   * @param data - Prompt data
   * @returns Observable with the created prompt
   */
  createPrompt(data: CreatePromptRequest): Observable<Prompt> {
    return this.http.post<Prompt>(`${this.API_URL}/`, data);
  }

  /**
   * Update an existing prompt
   * @param promptId - The prompt ID
   * @param data - Updated prompt data
   * @returns Observable with the updated prompt
   */
  updatePrompt(promptId: number, data: CreatePromptRequest): Observable<Prompt> {
    return this.http.patch<Prompt>(`${this.API_URL}/${promptId}/`, data);
  }

  /**
   * Delete a prompt
   * @param promptId - The prompt ID
   * @returns Observable with the deletion response
   */
  deletePrompt(promptId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${promptId}/`);
  }
}
