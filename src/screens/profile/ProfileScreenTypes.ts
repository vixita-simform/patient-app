import type { ComponentType } from "react";

import type { ProfileMenuId, ProfileMenuTone, ProfileStatId } from "../../constants";

/** Icon component shape accepted by the menu rows. */
export type ProfileIconComponent = ComponentType<{ size?: number; color?: string }>;

export interface ProfileMenuItem {
  id: ProfileMenuId;
  title: string;
  tone: ProfileMenuTone;
  Icon: ProfileIconComponent;
  /** Optional count shown in a grey pill before the chevron. */
  badge?: string;
}

export interface ProfileStat {
  id: ProfileStatId;
  value: string;
  label: string;
}

export interface ProfileData {
  initials: string;
  name: string;
  uhid: string;
  phone: string;
  bloodGroup: string;
  age: number;
  weightKg: number;
  familyCount: number;
}

export interface UseProfileScreenReturn {
  profile: ProfileData;
  stats: readonly ProfileStat[];
  menuItems: readonly ProfileMenuItem[];
  onSettingsPress: () => void;
  onEditPress: () => void;
  onMenuItemPress: (id: ProfileMenuId) => void;
  onLogoutPress: () => void;
}
