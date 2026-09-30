export type AvatarTone = "navy" | "green" | "blue" | "amber";
export type AvatarSize = "compact" | "regular";

export interface AvatarProps {
  initials: string;
  tone?: AvatarTone;
  /** compact = 44px (header), regular = 48px */
  size?: AvatarSize;
}
