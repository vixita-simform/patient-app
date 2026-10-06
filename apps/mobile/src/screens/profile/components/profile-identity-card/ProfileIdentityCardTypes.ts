export interface ProfileIdentityCardProps {
  initials: string;
  name: string;
  /** UHID value without the "UHID: " prefix. */
  uhid: string;
  phone: string;
  /** Omitted until an edit-profile screen exists; the edit button then renders disabled. */
  onEditPress?: () => void;
}
