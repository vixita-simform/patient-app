import type { ListRenderItem } from "react-native";

import type { AvatarTone } from "../../components";
import type { DoctorSummary, SpecialtyId } from "../../types";

export interface SpecialtyChipItem {
  id: SpecialtyId;
  label: string;
}

/** Avatar tones cycled across the list. */
export type DoctorAvatarTone = Extract<AvatarTone, "green" | "blue" | "amber">;

export interface FindADoctorScreenProps {
  /** Hides the header back button when the screen is a tab root (e.g. the Visits tab). */
  showBackButton?: boolean;
}

export interface UseFindADoctorScreenReturn {
  chips: readonly SpecialtyChipItem[];
  /** Rows to render: empty while loading or on error. */
  listData: readonly DoctorSummary[];
  /** Count line under the chips, singular or plural. */
  countLabel: string;
  isLoading: boolean;
  isError: boolean;
  selectedSpecialty: SpecialtyId;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSpecialtyPress: (id: SpecialtyId) => void;
  renderItem: ListRenderItem<DoctorSummary>;
  keyExtractor: (doctor: DoctorSummary) => string;
  onBackPress: () => void;
  onFilterPress: () => void;
}
