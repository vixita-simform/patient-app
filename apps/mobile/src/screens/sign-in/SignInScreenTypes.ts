import type { AuthMethod, AuthTab, CountryCode } from '../../constants';
import type { SegmentedTabItem } from '../../components';

export interface SignInFormValues {
  tab: AuthTab;
  method: AuthMethod;
  /** ISO code of the selected country. */
  countryCode: string;
  mobile: string;
  patientId: string;
  password: string;
}

export interface UseSignInScreenReturn {
  tabs: readonly SegmentedTabItem<AuthTab>[];
  activeTab: AuthTab;
  /** Password mode shows the password field and signs in with it instead of an OTP. */
  isPasswordMode: boolean;
  countries: readonly CountryCode[];
  selectedCountry: CountryCode;
  mobile: string;
  patientId: string;
  password: string;
  /** Field messages appear once the field is touched; a failed sign-in shows under the active tab's field. */
  mobileError?: string;
  patientIdError?: string;
  passwordError?: string;
  patientIdMaxLength: number;
  isSubmitDisabled: boolean;
  /** True while the sign-in request is in flight. */
  isSubmitting: boolean;
  onTabPress: (id: AuthTab) => void;
  onCountrySelect: (code: string) => void;
  onMobileChange: (text: string) => void;
  onPatientIdChange: (text: string) => void;
  onMobileBlur: () => void;
  onPatientIdBlur: () => void;
  onPasswordChange: (text: string) => void;
  onPasswordBlur: () => void;
  onAuthMethodToggle: () => void;
  onSubmitPress: () => void;
  onEmergencyPress: () => void;
}
