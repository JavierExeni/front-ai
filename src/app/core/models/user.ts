export interface ICountry {
  id: number;
  name: string;
  code: string;
  dial_code?: string;
}

export interface IUserSubscription {
  id: number;
  plan: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  avatar: string | null;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  phone: string | null;
  has_company: boolean;
  platform_role: string;
  company_id: number | null;
  country: ICountry | null;
  subscription?: IUserSubscription[];
  is_skip_twilio_credentials?: boolean;
  is_skip_invite_members?: boolean;
}

export interface LoginResponse extends User {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

/**
 * Request payload for Google authentication
 */
export interface GoogleAuthRequest {
  access_token: string;
}
