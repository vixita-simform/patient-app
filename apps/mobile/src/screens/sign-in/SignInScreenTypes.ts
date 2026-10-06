import type { AuthTab, CountryCode } from "../../constants";
import type { SegmentedTabItem } from "../../components";

export interface SignInFormValues {
  tab: AuthTab;
  /** ISO code of the selected country. */
  countryCode: string;
  mobile: string;
  patientId: string;
}

export interface UseSignInScreenReturn {
  tabs: readonly SegmentedTabItem<AuthTab>[];
  activeTab: AuthTab;
  countries: readonly CountryCode[];
  selectedCountry: CountryCode;
  mobile: string;
  patientId: string;
  /** Field messages appear once the field is touched; a failed sign-in shows under the active tab's field. */
  mobileError?: string;
  patientIdError?: string;
  patientIdMaxLength: number;
  isGetOtpDisabled: boolean;
  onTabPress: (id: AuthTab) => void;
  onCountrySelect: (code: string) => void;
  onMobileChange: (text: string) => void;
  onPatientIdChange: (text: string) => void;
  onMobileBlur: () => void;
  onPatientIdBlur: () => void;
  onGetOtpPress: () => void;
  onEmergencyPress: () => void;
}
