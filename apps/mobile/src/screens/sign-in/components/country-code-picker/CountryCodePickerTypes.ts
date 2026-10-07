import type { CountryCode } from '../../../../constants';

export interface CountryCodePickerProps {
  countries: readonly CountryCode[];
  selected: CountryCode;
  /** Called with the ISO code of the tapped country. */
  onSelect: (code: string) => void;
}
