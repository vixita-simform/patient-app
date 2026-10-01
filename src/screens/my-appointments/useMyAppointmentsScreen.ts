import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import {
  APPOINTMENT_STATUS,
  appointmentsDummyData,
  BUTTON_VARIANT,
  STACK_ROUTES,
  Strings,
  VISIT_MODE,
} from "../../constants";
import type { AppointmentStatus, AppointmentTab, VisitMode } from "../../constants";
import type { AvatarTone } from "../../components";
import type { AppointmentSummary } from "../../types";
import { formatDate, formatTime } from "../../utils";
import type { AppointmentActionItem } from "./components/appointment-card/AppointmentCardTypes";
import type {
  AppointmentListItem,
  UseMyAppointmentsScreenReturn,
} from "./MyAppointmentsScreenTypes";
import type { SegmentedTabItem } from "./components/segmented-tabs/SegmentedTabsTypes";

/** Tab order and labels as designed. */
const TABS: readonly SegmentedTabItem[] = Object.freeze([
  { id: "upcoming", label: Strings.MyAppointmentsScreen.upcoming },
  { id: "completed", label: Strings.MyAppointmentsScreen.completed },
  { id: "cancelled", label: Strings.MyAppointmentsScreen.cancelled },
]);

/** Badge label/tone per appointment status. Completed/cancelled reuse the green/amber
 * tones respectively — the design has no dedicated pill style for those two states
 * (see spec §8, "no cancelled/completed badge style in this screen's rules"). */
const STATUS_BADGE = Object.freeze({
  [APPOINTMENT_STATUS.confirmed]: {
    label: Strings.MyAppointmentsScreen.confirmed,
    tone: "green",
  },
  [APPOINTMENT_STATUS.pending]: {
    label: Strings.MyAppointmentsScreen.pending,
    tone: "amber",
  },
  [APPOINTMENT_STATUS.completed]: {
    label: Strings.MyAppointmentsScreen.completed,
    tone: "green",
  },
  [APPOINTMENT_STATUS.cancelled]: {
    label: Strings.MyAppointmentsScreen.cancelled,
    tone: "amber",
  },
} as const satisfies Record<AppointmentStatus, { label: string; tone: "green" | "amber" }>);

const VISIT_MODE_LABEL = Object.freeze({
  [VISIT_MODE.inPerson]: Strings.MyAppointmentsScreen.inPerson,
  [VISIT_MODE.video]: Strings.MyAppointmentsScreen.videoCall,
} as const satisfies Record<VisitMode, string>);

/**
 * Avatar tone rotation matching the spec's green/blue/coral card variety.
 * `Avatar` has no dedicated "coral" tone, so "amber" stands in as the closest
 * existing tone for the third card — a judgement call, flagged for review.
 */
const AVATAR_TONES: readonly AvatarTone[] = Object.freeze(["green", "blue", "amber"]);

/**
 * Builds the action-button pair for one appointment: in-person appointments get
 * Reschedule/Get directions, video ones get Cancel/Join call (with a video icon,
 * per spec). Only confirmed/pending appointments carry an action row, matching
 * the design (spec card 3 has none).
 * @param {AppointmentSummary} appointment - source appointment.
 * @returns {readonly AppointmentActionItem[] | undefined} the action pair, or undefined.
 */
const buildActions = (
  appointment: AppointmentSummary,
): readonly AppointmentActionItem[] | undefined => {
  const isActionable =
    appointment.status === APPOINTMENT_STATUS.confirmed ||
    appointment.status === APPOINTMENT_STATUS.pending;

  if (!isActionable) {
    return undefined;
  }

  if (appointment.visitMode === VISIT_MODE.video) {
    return [
      {
        label: Strings.Common.cancel,
        variant: BUTTON_VARIANT.line,
        // Disabled: cancel appointment flow not built yet.
        disabled: true,
        onPress: () => {},
      },
      {
        label: Strings.MyAppointmentsScreen.joinCall,
        variant: BUTTON_VARIANT.fill,
        icon: "video",
        // Disabled: join video call flow not built yet.
        disabled: true,
        onPress: () => {},
      },
    ];
  }

  return [
    {
      label: Strings.MyAppointmentsScreen.reschedule,
      variant: BUTTON_VARIANT.line,
      // Disabled: reschedule flow not built yet.
      disabled: true,
      onPress: () => {},
    },
    {
      label: Strings.MyAppointmentsScreen.getDirections,
      variant: BUTTON_VARIANT.fill,
      // Disabled: get directions flow not built yet.
      disabled: true,
      onPress: () => {},
    },
  ];
};

/**
 * State and handlers for My Appointments: tab selection, dummy data per tab,
 * and navigation to the doctor profile on card tap.
 * @returns {UseMyAppointmentsScreenReturn} tabs, list data, render helpers and handlers.
 */
export default function useMyAppointmentsScreen(): UseMyAppointmentsScreenReturn {
  const [activeTab, setActiveTab] = useState<AppointmentTab>("upcoming");
  // Mock request state: the static data never loads or fails.
  const isLoading = false;
  const isError = false;

  const onCardPress = useCallback((doctorId: string) => {
    router.push({ pathname: STACK_ROUTES.doctorProfile, params: { id: doctorId } });
  }, []);

  const listData = useMemo<readonly AppointmentListItem[]>(() => {
    return appointmentsDummyData[activeTab].map((appointment, index) => {
      const badge = STATUS_BADGE[appointment.status];

      return {
        id: appointment.id,
        initials: appointment.initials,
        avatarTone: AVATAR_TONES[index % AVATAR_TONES.length],
        doctorName: appointment.doctorName,
        specialtyLabel: appointment.specialtyLabel,
        visitMode: appointment.visitMode,
        visitModeLabel: VISIT_MODE_LABEL[appointment.visitMode],
        badgeLabel: badge.label,
        badgeTone: badge.tone,
        date: formatDate(appointment.scheduledAt),
        time: formatTime(appointment.scheduledAt),
        actions: buildActions(appointment),
        onPress: () => onCardPress(appointment.doctorId),
      };
    });
  }, [activeTab, onCardPress]);

  const onTabPress = useCallback((id: AppointmentTab) => {
    setActiveTab(id);
  }, []);

  // TODO: new appointment / booking entry not built yet
  const onPressAdd = useCallback(() => {}, []);

  return {
    tabs: TABS,
    activeTab,
    listData,
    isLoading,
    isError,
    onTabPress,
    onPressAdd,
  };
}
