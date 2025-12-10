import { CountryCode } from "libphonenumber-js";

export interface Country {
  id?: number; // ID from backend (optional for local generation)
  name: string;
  code: CountryCode; // ISO 3166-1 alpha-2 code
  dialCode: string;
  flagUrl: string; // URL de la imagen de la bandera
}
