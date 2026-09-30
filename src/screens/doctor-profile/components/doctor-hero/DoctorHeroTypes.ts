export interface DoctorHeroProps {
  initials: string;
  name: string;
  qualifications: string;
  /** Marks the favourite button selected; defaults to false. */
  isFavourite?: boolean;
  onBackPress?: () => void;
  onFavouritePress?: () => void;
}
