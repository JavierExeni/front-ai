export interface Contact {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  deleted_at: string | null;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  company_client: string;
  phone: string;
  contact_avatar: string | null;
  source_crm: string;
  source_id: string | null;
  status: string[];
  classification_reason: string | null;
  website: string | null;
  general_status: string | null;
  created_by: number | null;
  updated_by: number | null;
  company: number;
}

export interface ContactsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Contact[];
}
