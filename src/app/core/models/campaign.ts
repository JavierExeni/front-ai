import { CampaignAgent } from './agent';

export type CAMPAIGN_TYPE = 'outbound' | 'inbound';

export type INTERACTION_TYPE_INBOUND = 'inbound_call' | 'inbound_email' | 'inbound_sms';
export type INTERACTION_TYPE_OUTBOUND = 'outbound_call' | 'outbound_email' | 'outbound_sms';

/**
 * Paginated response wrapper
 */
export interface IPaginate<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Campaign sequence model
 */
export interface ISequence {
  id: number;
  order: number | null;
  assistant_id: string | null;
  prompt: string | null;
  email_subject: string | null;
  email_body: string | null;
  interaction_type: INTERACTION_TYPE_INBOUND | INTERACTION_TYPE_OUTBOUND;
  sub_interaction_type: string;
  execution_time_delay: number;
  greeting_message: string | null;
  created_at: string;
  is_active: boolean;
  campaign: number;
  agent_campaign: CampaignAgent;
}

/**
 * Campaign model
 */
export interface ICampaign {
  id: number;
  sequences: ISequence[];
  name: string;
  description: string;
  start_date: string | null;
  sources: string[] | null;
  lead_status: string[] | null;
  campaign_type: CAMPAIGN_TYPE;
  is_active: boolean;
  created_at: string;
  company: number;
}
