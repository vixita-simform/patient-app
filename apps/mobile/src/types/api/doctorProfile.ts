/** One OPD hours row; `hours` is null when the clinic is closed that day. */
export interface OpdHoursEntry {
  id: string;
  label: string;
  hours: string | null;
}

/** Profile fields beyond the list summary, keyed by DoctorSummary id. */
export interface DoctorProfileDetails {
  qualifications: string;
  patientsCount: string;
  about: string;
  opdHours: readonly OpdHoursEntry[];
  locationTitle: string;
  locationSubtitle: string;
  consultationFee: number;
  insuranceAccepted: boolean;
}
