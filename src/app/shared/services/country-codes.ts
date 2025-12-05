import { Injectable } from '@angular/core';
import { getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import { COUNTRY_NAMES } from '../constants/country-names.constant';
import { Country } from '../models/country';
@Injectable({
  providedIn: 'root',
})
export class CountryCodesService {
  // Genera URL de imagen de bandera desde flagcdn.com
  private getFlagUrl(countryCode: string): string {
    const code = countryCode.toLowerCase();
    return `https://flagcdn.com/w40/${code}.png`;
  }

  private readonly countryNames: Record<string, string> = COUNTRY_NAMES;

  getCountries(): Country[] {
    const isoCountries = getCountries();
    const countries: Country[] = [];

    for (const code of isoCountries) {
      try {
        const dialCode = getCountryCallingCode(code);
        const name = this.countryNames[code] || code;

        countries.push({
          name,
          code,
          dialCode: `+${dialCode}`,
          flagUrl: this.getFlagUrl(code),
        });
      } catch (error) {
        // Skip countries that don't have a valid calling code
        continue;
      }
    }

    return countries.sort((a, b) => a.name.localeCompare(b.name));
  }

  getCountryByCode(code: string): Country | undefined {
    return this.getCountries().find((country) => country.code === code);
  }

  getDefaultCountry(): Country {
    // Retorna US por defecto, puedes cambiar esto según tu necesidad
    return this.getCountryByCode('US') || this.getCountries()[0];
  }
}
