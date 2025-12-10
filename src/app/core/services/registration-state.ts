import { Injectable, signal, computed } from '@angular/core';

/**
 * Registration State Models
 */
export interface UserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  country?: number; // Country ID (primary key)
  phone_number?: string;
}

export interface CompanyData {
  name: string;
  website: string;
  size: string;
  headquarters: string;
  industry_pack_id: number | null; // Industry ID (primary key)
}

export interface TeamMember {
  email: string;
  is_company_admin: boolean;
}

export interface RegistrationPayload {
  user: UserData;
  company: CompanyData;
  members: TeamMember[];
}

/**
 * Global Registration State Service
 * Manages the state across all registration steps
 */
@Injectable({
  providedIn: 'root'
})
export class RegistrationStateService {

  // Step 1: User Personal Info
  private _userData = signal<Partial<UserData>>({});
  readonly userData = this._userData.asReadonly();

  // Step 2: Company Info
  private _companyData = signal<Partial<CompanyData>>({});
  readonly companyData = this._companyData.asReadonly();

  // Step 3: Industry Selection
  private _selectedIndustry = signal<number | null>(null);
  readonly selectedIndustry = this._selectedIndustry.asReadonly();

  // Step 4: Team Members
  private _teamMembers = signal<TeamMember[]>([]);
  readonly teamMembers = this._teamMembers.asReadonly();

  // Flag to indicate if user came from Google login
  private _isGoogleUser = signal<boolean>(false);
  readonly isGoogleUser = this._isGoogleUser.asReadonly();

  // Computed: Check if all required steps are valid
  readonly isStep1Valid = computed(() => {
    const data = this._userData();
    if (this._isGoogleUser()) {
      // Google users don't need email/password
      return !!(data.first_name && data.last_name && data.country && data.phone_number);
    } else {
      // Normal users need everything
      return !!(data.email && data.password && data.first_name && data.last_name && data.country && data.phone_number);
    }
  });

  readonly isStep2Valid = computed(() => {
    const data = this._companyData();
    return !!(data.name && data.website && data.size && data.headquarters);
  });

  readonly isStep3Valid = computed(() => {
    return this._selectedIndustry() !== null;
  });

  // Step 4 is always valid (members are optional)
  readonly isStep4Valid = computed(() => true);

  readonly canSubmit = computed(() => {
    return this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid();
  });

  /**
   * Set user data from Step 1
   */
  setUserData(data: Partial<UserData>): void {
    this._userData.update(current => ({ ...current, ...data }));
  }

  /**
   * Set company data from Step 2
   */
  setCompanyData(data: Partial<CompanyData>): void {
    this._companyData.update(current => ({ ...current, ...data }));
  }

  /**
   * Set selected industry from Step 3
   */
  setSelectedIndustry(industryId: number | null): void {
    this._selectedIndustry.set(industryId);
  }

  /**
   * Add team member
   */
  addTeamMember(member: TeamMember): void {
    this._teamMembers.update(members => [...members, member]);
  }

  /**
   * Remove team member
   */
  removeTeamMember(email: string): void {
    this._teamMembers.update(members => members.filter(m => m.email !== email));
  }

  /**
   * Update team member
   */
  updateTeamMember(email: string, updates: Partial<TeamMember>): void {
    this._teamMembers.update(members =>
      members.map(m => m.email === email ? { ...m, ...updates } : m)
    );
  }

  /**
   * Set if user is from Google login
   */
  setIsGoogleUser(isGoogle: boolean): void {
    this._isGoogleUser.set(isGoogle);
  }

  /**
   * Build the final registration payload for normal registration
   */
  buildRegistrationPayload(): RegistrationPayload {
    const userData = this._userData();
    const companyData = this._companyData();
    const industryId = this._selectedIndustry();
    const members = this._teamMembers();

    return {
      user: {
        email: userData.email!,
        password: userData.password!,
        first_name: userData.first_name!,
        last_name: userData.last_name!,
        ...(userData.country && { country: userData.country }),
        ...(userData.phone_number && { phone_number: userData.phone_number })
      },
      company: {
        name: companyData.name!,
        website: companyData.website!,
        size: companyData.size!,
        headquarters: companyData.headquarters!,
        industry_pack_id: industryId
      },
      members: members
    };
  }

  /**
   * Build payload for Google users (updating existing user)
   * They don't send email/password, only update fields
   */
  buildGoogleUserPayload(userId: string): any {
    const userData = this._userData();
    const companyData = this._companyData();
    const industryId = this._selectedIndustry();
    const members = this._teamMembers();

    return {
      user: {
        first_name: userData.first_name!,
        last_name: userData.last_name!,
        ...(userData.country && { country: userData.country }),
        ...(userData.phone_number && { phone_number: userData.phone_number })
      },
      company: {
        user: userId,
        name: companyData.name!,
        website: companyData.website!,
        size: companyData.size!,
        headquarters: companyData.headquarters!,
        industry_pack_id: industryId
      },
      members: members
    };
  }

  /**
   * Reset all state (useful after successful registration or on logout)
   */
  reset(): void {
    this._userData.set({});
    this._companyData.set({});
    this._selectedIndustry.set(null);
    this._teamMembers.set([]);
    this._isGoogleUser.set(false);
  }
}
