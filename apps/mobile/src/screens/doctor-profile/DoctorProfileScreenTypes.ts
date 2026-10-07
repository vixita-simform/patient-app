import type { ViewStyle } from 'react-native';

import type { DoctorProfileDetails, DoctorSummary } from '../../types';

/** Summary from the list joined with the profile-only details. */
export interface DoctorProfileData {
  summary: DoctorSummary;
  details: DoctorProfileDetails;
}

export interface UseDoctorProfileScreenReturn {
  /** The looked-up doctor, or null when the id is unknown. */
  doctor: DoctorProfileData | null;
  isLoading: boolean;
  isError: boolean;
  isFavourite: boolean;
  /** Bottom safe-area padding for the fixed footer. */
  footerInsetStyle: ViewStyle;
  onBackPress: () => void;
  onFavouritePress: () => void;
  onVideoPress: () => void;
  onBookPress: () => void;
}
