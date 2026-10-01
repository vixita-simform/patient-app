import type { AvatarTone } from "../../constants";

export type { AvatarTone };
export type AvatarSize = "compact" | "regular";

export interface AvatarProps {
  initials: string;
  tone?: AvatarTone;
  /** compact = 44px (header), regular = 48px */
  size?: AvatarSize;
}
