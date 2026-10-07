import type { AvatarTone } from '../../../../components';

export interface DoctorCardProps {
  id: string;
  initials: string;
  tone: AvatarTone;
  name: string;
  specialtyLabel: string;
  experienceYears: number;
  rating: string;
  reviewCount: number;
  nextSlot: string;
  /** Filled Book button when true, outlined otherwise. */
  availableToday: boolean;
  /** Opens the doctor profile; the Book button keeps its own press. */
  onPress: (id: string) => void;
  onBookPress: (id: string) => void;
}
