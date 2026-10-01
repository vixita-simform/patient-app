import { router } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

import {
  ActivityIcon,
  HelpIcon,
  SettingsIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from "../../assets/icons";
import {
  PROFILE_MENU_ID,
  PROFILE_MENU_TONE,
  PROFILE_STAT_ID,
  STACK_ROUTES,
  Strings,
  type ProfileMenuId,
} from "../../constants";
import { signOut } from "../../hooks";
import type {
  ProfileData,
  ProfileMenuItem,
  ProfileStat,
  UseProfileScreenReturn,
} from "./ProfileScreenTypes";

/** Static stand-in for the patient record until an API exists. */
const PROFILE_DATA: ProfileData = Object.freeze({
  initials: "AP",
  name: "Aarav Patel",
  uhid: "CW-2024-08812",
  phone: "+91 98765 43210",
  bloodGroup: "B+",
  age: 34,
  weightKg: 72,
  familyCount: 4,
});

/** Stats strip tiles, derived once from the static record. */
const PROFILE_STATS: readonly ProfileStat[] = Object.freeze([
  {
    id: PROFILE_STAT_ID.bloodGroup,
    value: PROFILE_DATA.bloodGroup,
    label: Strings.Common.bloodGroup,
  },
  {
    id: PROFILE_STAT_ID.age,
    value: `${PROFILE_DATA.age}${Strings.ProfileScreen.yrsSuffix}`,
    label: Strings.ProfileScreen.age,
  },
  {
    id: PROFILE_STAT_ID.weight,
    value: `${PROFILE_DATA.weightKg}${Strings.ProfileScreen.kgSuffix}`,
    label: Strings.ProfileScreen.weight,
  },
]);

/** Menu card rows, in display order. */
const PROFILE_MENU_ITEMS: readonly ProfileMenuItem[] = Object.freeze([
  {
    id: PROFILE_MENU_ID.personalInfo,
    title: Strings.ProfileScreen.personalMedicalInfo,
    tone: PROFILE_MENU_TONE.green,
    Icon: UserIcon,
  },
  {
    id: PROFILE_MENU_ID.familyMembers,
    title: Strings.ProfileScreen.familyMembers,
    tone: PROFILE_MENU_TONE.blue,
    Icon: UsersIcon,
    badge: String(PROFILE_DATA.familyCount),
  },
  {
    id: PROFILE_MENU_ID.insurance,
    title: Strings.ProfileScreen.insuranceClaims,
    tone: PROFILE_MENU_TONE.blue,
    Icon: ShieldIcon,
  },
  {
    id: PROFILE_MENU_ID.vitalsHistory,
    title: Strings.ProfileScreen.vitalsHistory,
    tone: PROFILE_MENU_TONE.amber,
    Icon: ActivityIcon,
  },
  {
    id: PROFILE_MENU_ID.settings,
    title: Strings.ProfileScreen.settings,
    tone: PROFILE_MENU_TONE.green,
    Icon: SettingsIcon,
  },
  {
    id: PROFILE_MENU_ID.help,
    title: Strings.ProfileScreen.helpSupport,
    tone: PROFILE_MENU_TONE.amber,
    Icon: HelpIcon,
  },
]);

/**
 * Data and handlers for the Profile tab. Only the personal info row navigates
 * so far; the other destinations are not built yet, so those handlers are
 * intentional no-op placeholders.
 * @returns {UseProfileScreenReturn} Profile data, derived stats, menu rows and handlers.
 */
export default function useProfileScreen(): UseProfileScreenReturn {
  const onSettingsPress = useCallback((): void => {
    // Placeholder: Settings screen not built yet.
  }, []);

  const onEditPress = useCallback((): void => {
    // Placeholder: edit-profile destination not built yet.
  }, []);

  const onMenuItemPress = useCallback((id: ProfileMenuId): void => {
    if (id === PROFILE_MENU_ID.personalInfo) {
      router.push(STACK_ROUTES.personalAndMedicalInfo);
    }
    // Other ids: destination screens not built yet.
  }, []);

  const onLogoutPress = useCallback((): void => {
    // The root layout's route guard then moves to sign in.
    signOut().catch(() => {
      // Token could not be cleared from secure storage, so the user is still signed in.
      Alert.alert(Strings.ProfileScreen.logOutFailed);
    });
  }, []);

  return {
    profile: PROFILE_DATA,
    stats: PROFILE_STATS,
    menuItems: PROFILE_MENU_ITEMS,
    onSettingsPress,
    onEditPress,
    onMenuItemPress,
    onLogoutPress,
  };
}
