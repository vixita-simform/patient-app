/** Specialty filter ids; `all` disables filtering. */
export type SpecialtyId =
  | "all"
  | "cardiology"
  | "orthopedics"
  | "pediatrics"
  | "dermatology"
  | "ent";

export interface DoctorSummary {
  id: string;
  initials: string;
  name: string;
  specialty: Exclude<SpecialtyId, "all">;
  specialtyLabel: string;
  experienceYears: number;
  rating: string;
  reviewCount: number;
  /** ISO 8601 date-time of the next free slot. */
  nextSlotAt: string;
  availableToday: boolean;
}

export interface DoctorListResponse {
  totalAvailableToday: number;
  doctors: readonly DoctorSummary[];
}
