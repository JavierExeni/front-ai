import { Component, signal, inject, ChangeDetectionStrategy, output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { PhoneInputComponent } from '../../../../shared/components/phone-input/phone-input';
import { CountriesApiService } from '../../../../core/services/countries-api';
import { ICountry } from '../../../../core/models/user';
import { RegistrationStateService } from '../../../../core/services/registration-state';
import { Auth } from '../../../../core/services/auth';
import { Password } from 'primeng/password';

@Component({
  selector: 'form-step-one',
  imports: [ReactiveFormsModule, InputText, Select, PhoneInputComponent, Password],
  templateUrl: './form-step-one.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormStepOne implements OnInit {
  activateStep = output<number>();
  private readonly fb = inject(FormBuilder);
  private readonly countriesApiService = inject(CountriesApiService);
  private readonly registrationState = inject(RegistrationStateService);
  private readonly authService = inject(Auth);

  readonly countries = signal<ICountry[]>([]);
  readonly isGoogleUser = this.registrationState.isGoogleUser;
  readonly isLoadingCountries = signal<boolean>(true);

  readonly personalInfoForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    country: [null, [Validators.required]],
    phoneNumber: ['', [Validators.required]],
  });

  ngOnInit(): void {
    // Load countries from backend
    this.isLoadingCountries.set(true);
    this.countriesApiService.fetchCountries().subscribe({
      next: (countries) => {
        this.countries.set(countries);
        this.isLoadingCountries.set(false);

        // Load existing state if user is navigating back (after countries are loaded)
        const existingData = this.registrationState.userData();
        if (existingData.first_name && existingData.country) {
          const selectedCountry = this.countries().find(c => c.id === existingData.country);
          this.personalInfoForm.patchValue({
            email: existingData.email || '',
            password: existingData.password || '',
            firstName: existingData.first_name || '',
            lastName: existingData.last_name || '',
            country: selectedCountry || null,
            phoneNumber: existingData.phone_number || '',
          });
        }
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.isLoadingCountries.set(false);
      }
    });

    // Check if user came from Google login
    const currentUser = this.authService.currentUser();
    if (currentUser && this.authService.isAuthenticated()) {
      // User came from Google login
      this.registrationState.setIsGoogleUser(true);

      // Pre-fill data from Google
      this.personalInfoForm.patchValue({
        email: currentUser.email,
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
      });

      // If user already has a country from backend, select it
      if (currentUser.country) {
        this.personalInfoForm.patchValue({
          country: currentUser.country
        });
      }

      // Remove email and password validators for Google users
      this.personalInfoForm.get('email')?.clearValidators();
      this.personalInfoForm.get('email')?.disable();
      this.personalInfoForm.get('password')?.clearValidators();
      this.personalInfoForm.get('password')?.updateValueAndValidity();
    } else {
      // Normal registration
      this.registrationState.setIsGoogleUser(false);
    }
  }

  onSubmit(): void {
    if (this.personalInfoForm.valid) {
      const formValue = this.personalInfoForm.getRawValue();

      // Save to global state (save country ID, not code)
      this.registrationState.setUserData({
        email: formValue.email,
        password: formValue.password,
        first_name: formValue.firstName,
        last_name: formValue.lastName,
        country: formValue.country?.id, // Save country ID (primary key)
        phone_number: formValue.phoneNumber,
      });

      this.activateStep.emit(2);
    } else {
      this.personalInfoForm.markAllAsTouched();
    }
  }

  /**
   * Get flag URL for a country code
   */
  getFlagUrl(code: string): string {
    const countryCode = code.toLowerCase();
    return `https://flagcdn.com/w40/${countryCode}.png`;
  }
}
