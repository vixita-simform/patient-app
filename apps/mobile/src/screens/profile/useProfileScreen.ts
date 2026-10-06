import { router } from "expo-router";
import { useCallback, useMemo } from "react";
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
  BLOOD_GROUP,
  patientProfileDummyData,
  PROFILE_MENU_ID,
  PROFILE_MENU_TONE,
  PROFILE_STAT_ID,
  STACK_ROUTES,
  Strings,
  type BloodGroup,
  type ProfileMenuId,
} from "../../constants";
import { signOut } from "../../hooks";
import { getAgeInYears, parseDateOnly } from "../../utils";
import type {
  ProfileIdentity,
  ProfileMenuItem,
  ProfileStat,
  UseProfileScreenReturn,
} from "./ProfileScreenTypes";

const COMMON = Strings.Common;
const PATIENT = patientProfileDummyData;

/** Display label per blood group. */
const BLOOD_GROUP_LABEL = Object.freeze({
  [BLOOD_GROUP.aPositive]: COMMON.bloodAPositive,
  [BLOOD_GROUP.aNegative]: COMMON.bloodANegative,
  [BLOOD_GROUP.bPositive]: COMMON.bloodBPositive,
  [BLOOD_GROUP.bNegative]: COMMON.bloodBNegative,
  [BLOOD_GROUP.oPositive]: COMMON.bloodOPositive,
  [BLOOD_GROUP.oNegative]: COMMON.bloodONegative,
  [BLOOD_GROUP.abPositive]: COMMON.bloodABPositive,
  [BLOOD_GROUP.abNegative]: COMMON.bloodABNegative,
} as const satisfies Record<BloodGroup, string>);

/** Identity card fields, derived once from the patient profile. */
const PROFILE_IDENTITY: ProfileIdentity = Object.freeze({
  initials: PATIENT.initials,
  name: `${PATIENT.firstName} ${PATIENT.lastName}`,
  uhid: PATIENT.uhid,
  phone: PATIENT.phone,
});

/** Menu card rows, in display order. Only Personal & medical info has a screen so far. */
const PROFILE_MENU_ITEMS: readonly ProfileMenuItem[] = Object.freeze([
  {
    id: PROFILE_MENU_ID.personalInfo,
    title: Strings.ProfileScreen.personalMedicalInfo,
    tone: PROFILE_MENU_TONE.green,
    Icon: UserIcon,
    isEnabled: true,
  },
  {
    id: PROFILE_MENU_ID.familyMembers,
    title: Strings.ProfileScreen.familyMembers,
    tone: PROFILE_MENU_TONE.blue,
    Icon: UsersIcon,
    badge: String(PATIENT.familyCount),
    isEnabled: false,
  },
  {
    id: PROFILE_MENU_ID.insurance,
    title: Strings.ProfileScreen.insuranceClaims,
    tone: PROFILE_MENU_TONE.blue,
    Icon: ShieldIcon,
    isEnabled: false,
  },
  {
    id: PROFILE_MENU_ID.vitalsHistory,
    title: Strings.ProfileScreen.vitalsHistory,
    tone: PROFILE_MENU_TONE.amber,
    Icon: ActivityIcon,
    isEnabled: false,
  },
  {
    id: PROFILE_MENU_ID.settings,
    title: Strings.ProfileScreen.settings,
    tone: PROFILE_MENU_TONE.green,
    Icon: SettingsIcon,
    isEnabled: false,
  },
  {
    id: PROFILE_MENU_ID.help,
    title: Strings.ProfileScreen.helpSupport,
    tone: PROFILE_MENU_TONE.amber,
    Icon: HelpIcon,
    isEnabled: false,
  },
]);

/**
 * Data and handlers for the Profile tab. Destinations that aren't built yet get no
 * handler (or `isEnabled: false`), so their buttons render disabled.
 * @returns {UseProfileScreenReturn} Profile data, derived stats, menu rows and handlers.
 */
export default function useProfileScreen(): UseProfileScreenReturn {
  // Age depends on today's date, so it is derived once per mount rather than at module load.
  const stats = useMemo<readonly ProfileStat[]>(
    () => [
      {
        id: PROFILE_STAT_ID.bloodGroup,
        value: BLOOD_GROUP_LABEL[PATIENT.bloodGroup],
        label: COMMON.bloodGroup,
      },
      {
        id: PROFILE_STAT_ID.age,
        value: `${getAgeInYears(parseDateOnly(PATIENT.dateOfBirth))}${Strings.ProfileScreen.yrsSuffix}`,
        label: Strings.ProfileScreen.age,
      },
      {
        id: PROFILE_STAT_ID.weight,
        value: `${PATIENT.weightKg}${Strings.ProfileScreen.kgSuffix}`,
        label: Strings.ProfileScreen.weight,
      },
    ],
    [],
  );

  const onMenuItemPress = useCallback((id: ProfileMenuId): void => {
    if (id === PROFILE_MENU_ID.personalInfo) {
      router.push(STACK_ROUTES.personalAndMedicalInfo);
    }
  }, []);

  const onLogoutPress = useCallback((): void => {
    Alert.alert(Strings.ProfileScreen.logOutConfirmTitle, Strings.ProfileScreen.logOutConfirmMessage, [
      { text: COMMON.cancel, style: "cancel" },
      {
        text: Strings.ProfileScreen.logOut,
        style: "destructive",
        // The root layout's route guard then moves to sign in.
        onPress: () => {
          signOut().catch(() => {
            // Token could not be cleared from secure storage, so the user is still signed in.
            Alert.alert(Strings.ProfileScreen.logOutFailed);
          });
        },
      },
    ]);
  }, []);

  return {
    profile: PROFILE_IDENTITY,
    stats,
    menuItems: PROFILE_MENU_ITEMS,
    onSettingsPress: undefined,
    onEditPress: undefined,
    onMenuItemPress,
    onLogoutPress,
  };
}
