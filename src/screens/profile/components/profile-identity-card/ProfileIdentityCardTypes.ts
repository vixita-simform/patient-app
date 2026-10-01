export interface ProfileIdentityCardProps {
  initials: string;
  name: string;
  /** UHID value without the "UHID: " prefix. */
  uhid: string;
  phone: string;
  onEditPress?: () => void;
}
