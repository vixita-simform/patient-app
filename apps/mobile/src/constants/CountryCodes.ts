import Strings from './Strings';

/** A selectable country calling code with its national-number rules. */
export interface CountryCode {
  /** Display name, from `Strings.CountryNames`. */
  name: string;
  /** ISO 3166-1 alpha-2 code; unique, used as the list key. */
  code: string;
  dialCode: string;
  /** Flag emoji. */
  flag: string;
  minLength: number;
  maxLength: number;
  /** Characters allowed as the first digit, as a regex class body (e.g. "6-9"). */
  leadingDigits?: string;
}

const INDIA: CountryCode = Object.freeze({
  name: Strings.CountryNames.india,
  code: 'IN',
  dialCode: '+91',
  flag: '🇮🇳',
  minLength: 10,
  maxLength: 10,
  leadingDigits: '6-9'
});

/** Country selected when the sign-in screen opens. */
export const DEFAULT_COUNTRY: CountryCode = INDIA;

/** Selectable country codes, India first. */
export const COUNTRY_CODES: readonly CountryCode[] = Object.freeze([
  INDIA,
  {
    name: Strings.CountryNames.unitedStates,
    code: 'US',
    dialCode: '+1',
    flag: '🇺🇸',
    minLength: 10,
    maxLength: 10,
    leadingDigits: '2-9'
  },
  {
    name: Strings.CountryNames.unitedKingdom,
    code: 'GB',
    dialCode: '+44',
    flag: '🇬🇧',
    minLength: 10,
    maxLength: 10,
    leadingDigits: '7'
  },
  {
    name: Strings.CountryNames.unitedArabEmirates,
    code: 'AE',
    dialCode: '+971',
    flag: '🇦🇪',
    minLength: 9,
    maxLength: 9,
    leadingDigits: '5'
  },
  {
    name: Strings.CountryNames.saudiArabia,
    code: 'SA',
    dialCode: '+966',
    flag: '🇸🇦',
    minLength: 9,
    maxLength: 9,
    leadingDigits: '5'
  },
  {
    name: Strings.CountryNames.singapore,
    code: 'SG',
    dialCode: '+65',
    flag: '🇸🇬',
    minLength: 8,
    maxLength: 8,
    leadingDigits: '3689'
  },
  {
    name: Strings.CountryNames.australia,
    code: 'AU',
    dialCode: '+61',
    flag: '🇦🇺',
    minLength: 9,
    maxLength: 9,
    leadingDigits: '4'
  },
  {
    name: Strings.CountryNames.canada,
    code: 'CA',
    dialCode: '+1',
    flag: '🇨🇦',
    minLength: 10,
    maxLength: 10,
    leadingDigits: '2-9'
  },
  {
    name: Strings.CountryNames.bangladesh,
    code: 'BD',
    dialCode: '+880',
    flag: '🇧🇩',
    minLength: 10,
    maxLength: 10,
    leadingDigits: '1'
  },
  {
    name: Strings.CountryNames.nepal,
    code: 'NP',
    dialCode: '+977',
    flag: '🇳🇵',
    minLength: 10,
    maxLength: 10,
    leadingDigits: '9'
  },
  {
    name: Strings.CountryNames.sriLanka,
    code: 'LK',
    dialCode: '+94',
    flag: '🇱🇰',
    minLength: 9,
    maxLength: 9,
    leadingDigits: '7'
  },
  {
    name: Strings.CountryNames.pakistan,
    code: 'PK',
    dialCode: '+92',
    flag: '🇵🇰',
    minLength: 10,
    maxLength: 10,
    leadingDigits: '3'
  }
]);

/**
 * Finds a country by ISO code, falling back to the default (India).
 * @param {string} code - ISO 3166-1 alpha-2 code.
 * @returns {CountryCode} The matching country, or the default.
 */
export const getCountryByCode = (code: string): CountryCode =>
  COUNTRY_CODES.find((country) => country.code === code) ?? DEFAULT_COUNTRY;
