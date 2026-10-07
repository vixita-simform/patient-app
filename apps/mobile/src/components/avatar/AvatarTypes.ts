import type { AvatarSize, AvatarTone } from '../../constants';

export type { AvatarSize, AvatarTone };

export interface AvatarProps {
  initials: string;
  tone?: AvatarTone;
  /** compact 44 (header), regular 48, large 64 (profile card), xLarge 88 (photo edit). */
  size?: AvatarSize;
}
