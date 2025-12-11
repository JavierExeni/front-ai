export interface ICompany {
  id: number;
  name: string;
  website: string | null;
  headquarters: string | null;
  size: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  website?: string;
  headquarters?: string;
  size?: string;
}

export const COMPANY_SIZES = [
  { label: '1-10 employees', value: '1-10' },
  { label: '11-50 employees', value: '11-50' },
  { label: '51-200 employees', value: '51-200' },
  { label: '201-500 employees', value: '201-500' },
  { label: '501-1000 employees', value: '501-1000' },
  { label: '1001-5000 employees', value: '1001-5000' },
  { label: '5000+ employees', value: '5000+' },
];
