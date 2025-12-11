import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { toast } from 'ngx-sonner';
import { Auth } from '../../../core/services/auth';
import { CompanyApiService } from '../../../core/services/company-api';
import { COMPANY_SIZES } from '../../../core/models/company';

@Component({
  selector: 'app-company-settings',
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule],
  templateUrl: './company-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanySettingsComponent implements OnInit {
  private readonly auth = inject(Auth);
  private readonly companyApiService = inject(CompanyApiService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly currentUser = this.auth.currentUser;
  readonly company = signal<any>(null);
  readonly isLoading = signal(false);
  readonly isLoadingCompany = signal(true);
  readonly isDeleting = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly canDeleteCompany = signal(true);

  // Company sizes options
  readonly companySizes = COMPANY_SIZES;

  // Form
  companyForm!: FormGroup;

  constructor() {
    // React when currentUser changes (when it loads)
    effect(() => {
      const user = this.currentUser();
      if (user?.company_id) {
        this.loadCompanyData(user.company_id);
      }
    });
  }

  ngOnInit(): void {
    this.checkCanDeleteCompany();

    // Check if user is already loaded
    const user = this.currentUser();
    if (!user) {
      // User not loaded yet, load it manually
      this.isLoadingCompany.set(true);
      this.auth.loadCurrentUser().subscribe({
        next: (loadedUser) => {
          this.loadCompanyData(loadedUser.company_id!);
        },
        error: (error) => {
          console.error('Error loading user:', error);
          toast.error('Failed to load user data');
          this.isLoadingCompany.set(false);
          this.initializeForm();
        },
        // Success will be handled by effect when currentUser changes
      });
    } else if (!user.company_id) {
      // User exists but has no company
      this.isLoadingCompany.set(false);
      this.initializeForm();
    }
    // If user exists with company_id, effect will handle it
  }

  private loadCompanyData(companyId: number): void {
    this.isLoadingCompany.set(true);

    this.companyApiService.getCompany(companyId).subscribe({
      next: (company) => {
        this.company.set(company);
        this.initializeForm(company);
        this.isLoadingCompany.set(false);
      },
      error: (error) => {
        console.error('Error loading company:', error);
        toast.error('Failed to load company data');
        this.isLoadingCompany.set(false);
        // Initialize empty form even on error
        this.initializeForm();
      },
    });
  }

  private initializeForm(company?: any): void {
    this.companyForm = this.fb.group({
      name: [company?.name || '', Validators.required],
      website: [company?.website || ''],
      headquarters: [company?.headquarters || ''],
      size: [company?.size || null],
    });
  }

  private checkCanDeleteCompany(): void {
    // User can only delete if they have a company
    // Assuming users work with a single company related to their account
    this.canDeleteCompany.set(false); // Disable by default based on business logic
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      return;
    }

    const user = this.currentUser();
    if (!user?.company_id) {
      toast.error('No company associated with your account');
      return;
    }

    this.isLoading.set(true);

    const payload = this.companyForm.value;

    this.companyApiService.updateCompany(user.company_id, payload).subscribe({
      next: (updatedCompany) => {
        this.isLoading.set(false);
        this.company.set(updatedCompany);
        toast.success('Company updated successfully');
        // Reset form to pristine state after successful update
        this.companyForm.markAsPristine();
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error updating company:', error);
        toast.error('Failed to update company');
      },
    });
  }

  toggleDeleteConfirm(): void {
    this.showDeleteConfirm.update((v) => !v);
  }

  deleteCompany(): void {
    const user = this.currentUser();
    if (!user?.company_id || !this.canDeleteCompany()) return;

    this.isDeleting.set(true);

    this.companyApiService.deleteCompany(user.company_id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        toast.success('Company deleted successfully');
        // TODO: Handle post-deletion logic (redirect, reload user, etc.)
      },
      error: (error) => {
        this.isDeleting.set(false);
        console.error('Error deleting company:', error);
        toast.error('Failed to delete company');
      },
    });
  }
}
