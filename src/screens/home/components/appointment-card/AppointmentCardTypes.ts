export interface AppointmentCardProps {
  initials: string;
  doctorName: string;
  detail: string;
  /** Omitted when the appointment has no status to show */
  badgeLabel?: string;
  date: string;
  time: string;
  onPress?: () => void;
}
