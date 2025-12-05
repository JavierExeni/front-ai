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
  country: string | null;
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
