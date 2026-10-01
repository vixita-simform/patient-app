import type { AvatarTone, StatusBadgeTone } from "../../../../components";
import type { ButtonVariant, VisitMode } from "../../../../constants";

export interface AppointmentActionItem {
  label: string;
  variant: ButtonVariant;
  /** Optional leading icon key, e.g. "video" on "Join call" — the card renders the matching icon. */
  icon?: "video";
  /** True while this action's flow isn't built yet, so the button renders but can't be pressed. */
  disabled?: boolean;
  onPress: () => void;
}

export interface AppointmentCardProps {
  initials: string;
  avatarTone: AvatarTone;
  doctorName: string;
  specialtyLabel: string;
  visitMode: VisitMode;
  visitModeLabel: string;
  badgeLabel: string;
  badgeTone: StatusBadgeTone;
  date: string;
  time: string;
  /** Omitted -> no action row (e.g. completed/cancelled cards). */
  actions?: readonly AppointmentActionItem[];
  onPress: () => void;
}
