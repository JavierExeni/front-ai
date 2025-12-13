export interface VoiceAgent {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  deleted_at: string | null;
  name: string;
  agent_type: 'voice' | 'email' | 'sms';
  platform_id: string;
  agent_elevenlabs_id: string;
  audio_url: string;
  accent: string;
  gender: string;
  avatar: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface CampaignAgent {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  deleted_at: string | null;
  name: string;
  agent_title: string;
  created_by: number | null;
  updated_by: number | null;
  company: number;
  campaigns: any[];
  agent: VoiceAgent;
}
