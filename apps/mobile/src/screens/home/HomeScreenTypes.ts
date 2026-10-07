import type { AppointmentCardProps } from './components/appointment-card/AppointmentCardTypes';
import type { OpdTokenCardProps } from './components/opd-token-card/OpdTokenCardTypes';

export interface HomeUser {
  initials: string;
  name: string;
}

export interface HomeVital {
  value: string;
  unit?: string;
}

export interface HomeVitals {
  heart: HomeVital;
  bloodPressure: HomeVital;
  sugar: HomeVital;
}

export type HomeAppointment = Omit<AppointmentCardProps, 'onPress'>;

export interface HomeViewData {
  user: HomeUser;
  /** null when the patient has no OPD token today. */
  token: OpdTokenCardProps | null;
  appointment: HomeAppointment | null;
  vitals: HomeVitals;
}

export interface UseHomeScreenReturn {
  data: HomeViewData;
  onPressBell: () => void;
  onPressBookVisit: () => void;
  onPressLabReports: () => void;
  onPressMedicines: () => void;
  onPressCallAmbulance: () => void;
  onPressSeeAll: () => void;
  onPressHistory: () => void;
  onPressAppointment: () => void;
}
