export interface Prompt {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  deleted_at: string | null;
  agent_type: string;
  name: string;
  prompt: string;
  company: number;
  created_by: number | null;
  updated_by: number | null;
}
