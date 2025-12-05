import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  forwardRef,
  input,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
  FormsModule,
} from '@angular/forms';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { CountryCodesService } from '../../services/country-codes';
import { Country } from '../../models/country';
import { PhoneValue } from '../../models/phone-value';

@Component({
  selector: 'app-phone-input',
  imports: [Select, InputText, FormsModule],
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
})
export class PhoneInputComponent implements ControlValueAccessor, Validator {
  private readonly countryCodesService = inject(CountryCodesService);

  // Inputs
  readonly placeholder = input<string>('Enter phone number');
  readonly disabled = input<boolean>(false);

  // State
  readonly countries = signal<Country[]>([]);
  readonly selectedCountry = signal<Country | null>(null);
  readonly phoneNumber = signal<string>('');
  readonly touched = signal<boolean>(false);

  // Computed
  readonly fullPhoneNumber = computed(() => {
    const country = this.selectedCountry();
    const number = this.phoneNumber();
    if (!country || !number) return '';
    return `${country.dialCode}${number}`;
  });

  readonly isValid = computed(() => {
    const country = this.selectedCountry();
    const number = this.phoneNumber();
    if (!country || !number) return true; // Empty is valid (required validation should be handled separately)

    try {
      return isValidPhoneNumber(this.fullPhoneNumber(), country.code as any);
    } catch {
      return false;
    }
  });

  // ControlValueAccessor
  private onChange: (value: PhoneValue | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    const countries = this.countryCodesService.getCountries();
    this.countries.set(countries);
    this.selectedCountry.set(this.countryCodesService.getDefaultCountry());
  }

  // Maneja el cambio de país
  onCountryChange(country: Country): void {
    console.log(country);
    this.selectedCountry.set(country);
    this.emitValue();
  }

  // Maneja el cambio del número
  onPhoneNumberChange(value: string): void {
    // Limpiar el input para permitir solo números
    const cleaned = value.replace(/\D/g, '');
    this.phoneNumber.set(cleaned);
    this.emitValue();
  }

  // Marca como touched
  onBlur(): void {
    if (!this.touched()) {
      this.touched.set(true);
      this.onTouched();
    }
  }

  private emitValue(): void {
    const country = this.selectedCountry();
    const number = this.phoneNumber();

    if (!country) {
      this.onChange(null);
      return;
    }

    const value: PhoneValue = {
      countryCode: country.code,
      dialCode: country.dialCode,
      number: number,
      fullNumber: this.fullPhoneNumber(),
    };

    this.onChange(value);
  }

  // ControlValueAccessor methods
  writeValue(value: PhoneValue | string | null): void {
    if (!value) {
      this.phoneNumber.set('');
      this.selectedCountry.set(this.countryCodesService.getDefaultCountry());
      return;
    }

    // Si recibimos un string, intentar parsearlo
    if (typeof value === 'string') {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed) {
          const country = this.countryCodesService.getCountryByCode(parsed.country || 'US');
          if (country) {
            this.selectedCountry.set(country);
          }
          this.phoneNumber.set(parsed.nationalNumber);
        }
      } catch {
        this.phoneNumber.set(value);
      }
      return;
    }

    // Si recibimos un PhoneValue
    const country = this.countryCodesService.getCountryByCode(value.countryCode);
    if (country) {
      this.selectedCountry.set(country);
    }
    this.phoneNumber.set(value.number);
  }

  registerOnChange(fn: (value: PhoneValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // El disabled se maneja vía el input signal
  }

  // Validator
  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Empty is valid (use required validator if needed)
    }

    if (!this.isValid()) {
      return { invalidPhone: true };
    }

    return null;
  }
}
