import { Component, signal, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { PhoneInputComponent } from '../../../../shared/components/phone-input/phone-input';
import { CountryCodesService } from '../../../../shared/services/country-codes';
import { Country } from '../../../../shared/models/country';

@Component({
  selector: 'form-step-one',
  imports: [ReactiveFormsModule, InputText, Select, PhoneInputComponent],
  templateUrl: './form-step-one.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormStepOne {
  activateStep = output<number>();
  private readonly fb = inject(FormBuilder);
  private readonly countryCodesService = inject(CountryCodesService);

  readonly countries = signal<Country[]>([]);

  readonly personalInfoForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    country: [null, [Validators.required]],
    phoneNumber: ['', [Validators.required]],
  });

  constructor() {
    // Load countries
    const countries = this.countryCodesService.getCountries();
    this.countries.set(countries);
  }

  onSubmit(): void {
    if (this.personalInfoForm.valid) {
      console.log('Form submitted:', this.personalInfoForm.value);
      this.activateStep.emit(2);
    } else {
      this.personalInfoForm.markAllAsTouched();
    }
  }
}
