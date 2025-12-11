import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { toast } from 'ngx-sonner';
import { Auth } from '../../core/services/auth';
import { UserApiService } from '../../core/services/user-api';
import { CountriesApiService } from '../../core/services/countries-api';
import { OtpApiService } from '../../core/services/otp-api';
import { PhoneInputComponent } from '../../shared/components/phone-input/phone-input';
import { OtpInputDialogComponent } from '../../shared/components/otp-input-dialog/otp-input-dialog';
import { CompanySettingsComponent } from './company-settings/company-settings';

@Component({
  selector: 'app-profile-account',
  imports: [
    TabsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    PhoneInputComponent,
    OtpInputDialogComponent,
    CompanySettingsComponent
  ],
  templateUrl: './profile-account.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileAccount implements OnInit {
  private readonly auth = inject(Auth);
  private readonly userApiService = inject(UserApiService);
  private readonly countriesApiService = inject(CountriesApiService);
  private readonly otpApiService = inject(OtpApiService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly currentUser = this.auth.currentUser;
  readonly countries = this.countriesApiService.countries;
  readonly isLoading = signal(false);
  readonly isLoadingUser = signal(true);
  readonly isDeleting = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly showOtpDialog = signal(false);
  readonly isVerifyingOtp = signal(false);

  // Form
  userForm!: FormGroup;
  initialPhone = '';

  // Temp storage for form data while waiting for OTP
  private pendingUpdateData: any = null;

  // Computed: Check if phone has changed
  readonly phoneChanged = computed(() => {
    if (!this.userForm) return false;

    const formValue = this.userForm.get('phone')?.value;
    if (!formValue) return false;

    // Extract phone number from form
    let currentPhone = '';
    if (typeof formValue === 'string') {
      currentPhone = formValue;
    } else if (typeof formValue === 'object') {
      currentPhone = formValue.fullNumber || formValue.number || '';
    }

    return currentPhone !== this.initialPhone && currentPhone !== '';
  });

  ngOnInit(): void {
    // Check if user is already loaded
    const user = this.currentUser();
    if (user) {
      // User already loaded by Auth service on startup
      this.initializeForm(user);
      this.isLoadingUser.set(false);
    } else {
      // User not loaded yet, wait for it or load manually
      // This typically happens if this page is accessed directly
      this.auth.loadCurrentUser().subscribe({
        next: (loadedUser) => {
          this.initializeForm(loadedUser);
          this.isLoadingUser.set(false);
        },
        error: (error) => {
          console.error('Error loading user:', error);
          toast.error('Failed to load user data');
          this.isLoadingUser.set(false);
        }
      });
    }

    // Fetch countries if not already loaded
    if (this.countries().length === 0) {
      this.countriesApiService.fetchCountries().subscribe({
        error: (error) => {
          console.error('Error loading countries:', error);
          toast.error('Failed to load countries');
        },
      });
    }
  }

  private initializeForm(user: any): void {
    this.initialPhone = user.phone || '';

    this.userForm = this.fb.group({
      first_name: [user.first_name || '', Validators.required],
      last_name: [user.last_name || '', Validators.required],
      country: [user.country || null],
      phone: [user.phone || ''],
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid || !this.currentUser()) {
      return;
    }

    const user = this.currentUser();
    if (!user) return;

    const formValue = this.userForm.value;

    // Extract phone number - handle both string and PhoneValue object
    let phoneNumber = '';
    if (typeof formValue.phone === 'string') {
      phoneNumber = formValue.phone;
    } else if (formValue.phone && typeof formValue.phone === 'object') {
      phoneNumber = formValue.phone.fullNumber || formValue.phone.number || '';
    }

    const payload: any = {
      first_name: formValue.first_name,
      last_name: formValue.last_name,
      country: formValue.country?.id || formValue.country,
      phone: phoneNumber,
    };

    // Check if phone changed - if so, request OTP
    const phoneChanged = phoneNumber !== this.initialPhone;
    if (phoneChanged && phoneNumber) {
      this.requestOtpAndShowDialog(payload);
    } else {
      // No phone change, update directly
      this.updateUserProfile(payload);
    }
  }

  private requestOtpAndShowDialog(payload: any): void {
    const user = this.currentUser();
    if (!user?.email) return;

    this.isLoading.set(true);
    this.pendingUpdateData = payload;

    this.otpApiService.requestOtp({ email: user.email, type: 'email' }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showOtpDialog.set(true);
        toast.success('Verification code sent to your email');
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error requesting OTP:', error);
        toast.error('Failed to send verification code');
      }
    });
  }

  onOtpComplete(otpCode: string): void {
    if (!this.pendingUpdateData || !this.currentUser()) return;

    this.isVerifyingOtp.set(true);

    // Add OTP code to the payload
    const payload = {
      ...this.pendingUpdateData,
      otp_code: otpCode
    };

    const user = this.currentUser();
    if (!user) return;

    this.userApiService.updateUser(user.id, payload).subscribe({
      next: (updatedUser) => {
        this.isVerifyingOtp.set(false);
        this.showOtpDialog.set(false);
        this.initialPhone = updatedUser.phone || '';
        this.pendingUpdateData = null;
        // Force form update to reflect new phone as initial value
        this.userForm.patchValue({ phone: updatedUser.phone || '' }, { emitEvent: false });
        toast.success('Profile updated successfully');
      },
      error: (error) => {
        this.isVerifyingOtp.set(false);
        console.error('Error updating profile with OTP:', error);
        const errorMessage = error.error?.message || 'Invalid verification code';
        toast.error(errorMessage);
      }
    });
  }

  onOtpDialogHide(): void {
    this.showOtpDialog.set(false);
    this.isVerifyingOtp.set(false);
    this.pendingUpdateData = null;
  }

  private updateUserProfile(payload: any): void {
    const user = this.currentUser();
    if (!user) return;

    this.isLoading.set(true);

    this.userApiService.updateUser(user.id, payload).subscribe({
      next: (updatedUser) => {
        this.isLoading.set(false);
        this.initialPhone = updatedUser.phone || '';
        // Force form update to reflect new phone as initial value
        this.userForm.patchValue({ phone: updatedUser.phone || '' }, { emitEvent: false });
        toast.success('Profile updated successfully');
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      },
    });
  }

  toggleDeleteConfirm(): void {
    this.showDeleteConfirm.update((v) => !v);
  }

  deleteAccount(): void {
    const user = this.currentUser();
    if (!user) return;

    this.isDeleting.set(true);

    this.userApiService.deleteAccount({ user_id: user.id }).subscribe({
      next: () => {
        this.isDeleting.set(false);
        toast.success('Account deleted successfully');
        this.auth.logout();
      },
      error: (error) => {
        this.isDeleting.set(false);
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      },
    });
  }

  /**
   * Get flag URL for a country code
   */
  getFlagUrl(code: string): string {
    const countryCode = code.toLowerCase();
    return `https://flagcdn.com/w40/${countryCode}.png`;
  }
}
