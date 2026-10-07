import type { AvatarTone } from '../../components';
import type { DoctorSummary, SpecialtyId } from '../../types';

export interface SpecialtyChipItem {
  id: SpecialtyId;
  label: string;
}

/** Avatar tones cycled across the list. */
export type DoctorAvatarTone = Extract<AvatarTone, 'green' | 'blue' | 'amber'>;

/** A doctor list row: the summary plus what the card needs that depends on the clock or the list. */
export interface DoctorRowData extends DoctorSummary {
  tone: DoctorAvatarTone;
  /** Next free slot, already formatted ("Today, 11:30 AM"). */
  nextSlotLabel: string;
}

export interface FindADoctorScreenProps {
  /** Hides the header back button when the screen is a tab root (e.g. the Visits tab). */
  showBackButton?: boolean;
}

export interface UseFindADoctorScreenReturn {
  chips: readonly SpecialtyChipItem[];
  /** Rows to render: empty while loading or on error. */
  listData: readonly DoctorRowData[];
  /** Count line under the chips, singular or plural. */
  countLabel: string;
  isLoading: boolean;
  isError: boolean;
  selectedSpecialty: SpecialtyId;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSpecialtyPress: (id: SpecialtyId) => void;
  keyExtractor: (doctor: DoctorRowData) => string;
  onDoctorPress: (id: string) => void;
  onBookPress: (id: string) => void;
  onBackPress: () => void;
  onFilterPress: () => void;
}
