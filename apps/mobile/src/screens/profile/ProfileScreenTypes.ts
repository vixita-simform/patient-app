import type { ComponentType } from 'react';

import type { ProfileMenuId, ProfileMenuTone, ProfileStatId } from '../../constants';

/** Icon component shape accepted by the menu rows. */
export type ProfileIconComponent = ComponentType<{ size?: number; color?: string }>;

export interface ProfileMenuItem {
  id: ProfileMenuId;
  title: string;
  tone: ProfileMenuTone;
  Icon: ProfileIconComponent;
  /** Optional count shown in a grey pill before the chevron. */
  badge?: string;
  /** False while the row's destination screen isn't built; the row then renders disabled. */
  isEnabled: boolean;
}

export interface ProfileStat {
  id: ProfileStatId;
  value: string;
  label: string;
}

/** Identity card fields. */
export interface ProfileIdentity {
  initials: string;
  name: string;
  uhid: string;
  phone: string;
}

export interface UseProfileScreenReturn {
  profile: ProfileIdentity;
  stats: readonly ProfileStat[];
  menuItems: readonly ProfileMenuItem[];
  /** Undefined until a Settings screen exists; the header button renders disabled. */
  onSettingsPress?: () => void;
  /** Undefined until an edit-profile screen exists; the edit button renders disabled. */
  onEditPress?: () => void;
  onMenuItemPress: (id: ProfileMenuId) => void;
  onLogoutPress: () => void;
}
