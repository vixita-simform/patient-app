import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import {
  APPOINTMENT_ACTION_ICON,
  APPOINTMENT_STATUS,
  APPOINTMENT_TAB,
  appointmentsDummyData,
  AVATAR_TONE,
  BUTTON_VARIANT,
  STACK_ROUTES,
  STATUS_BADGE_TONE,
  Strings,
  VISIT_MODE
} from '../../constants';
import type {
  AppointmentStatus,
  AppointmentTab,
  StatusBadgeTone,
  VisitMode
} from '../../constants';
import type { AvatarTone, SegmentedTabItem } from '../../components';
import type { AppointmentSummary } from '../../types';
import { formatDate, formatTime } from '../../utils';
import type { AppointmentActionItem } from './components';
import type {
  AppointmentListItem,
  UseMyAppointmentsScreenReturn
} from './MyAppointmentsScreenTypes';

/** Tab order and labels as designed. */
const TABS: readonly SegmentedTabItem<AppointmentTab>[] = Object.freeze([
  { id: APPOINTMENT_TAB.upcoming, label: Strings.MyAppointmentsScreen.upcoming },
  { id: APPOINTMENT_TAB.completed, label: Strings.MyAppointmentsScreen.completed },
  { id: APPOINTMENT_TAB.cancelled, label: Strings.MyAppointmentsScreen.cancelled }
]);

/** Badge label/tone per appointment status. The design has no dedicated pill for
 * completed/cancelled, so completed reuses green and cancelled uses coral, keeping it
 * visually distinct from the amber "Pending" pill. */
const STATUS_BADGE = Object.freeze({
  [APPOINTMENT_STATUS.confirmed]: {
    label: Strings.MyAppointmentsScreen.confirmed,
    tone: STATUS_BADGE_TONE.green
  },
  [APPOINTMENT_STATUS.pending]: {
    label: Strings.MyAppointmentsScreen.pending,
    tone: STATUS_BADGE_TONE.amber
  },
  [APPOINTMENT_STATUS.completed]: {
    label: Strings.MyAppointmentsScreen.completed,
    tone: STATUS_BADGE_TONE.green
  },
  [APPOINTMENT_STATUS.cancelled]: {
    label: Strings.MyAppointmentsScreen.cancelled,
    tone: STATUS_BADGE_TONE.coral
  }
} as const satisfies Record<AppointmentStatus, { label: string; tone: StatusBadgeTone }>);

const VISIT_MODE_LABEL = Object.freeze({
  [VISIT_MODE.inPerson]: Strings.Common.inPerson,
  [VISIT_MODE.video]: Strings.Common.videoCall
} as const satisfies Record<VisitMode, string>);

/**
 * Avatar tone rotation matching the spec's green/blue/coral card variety.
 * `Avatar` has no dedicated "coral" tone, so "amber" stands in as the closest
 * existing tone for the third card — a judgement call, flagged for review.
 */
const AVATAR_TONES: readonly AvatarTone[] = Object.freeze([
  AVATAR_TONE.green,
  AVATAR_TONE.blue,
  AVATAR_TONE.amber
]);

/**
 * Builds the action-button pair for one appointment: in-person appointments get
 * Reschedule/Get directions, video ones get Cancel/Join call (with a video icon,
 * per spec). Only confirmed/pending appointments carry an action row, matching
 * the design (spec card 3 has none).
 * @param {AppointmentSummary} appointment - source appointment.
 * @returns {readonly AppointmentActionItem[] | undefined} the action pair, or undefined.
 */
const buildActions = (
  appointment: AppointmentSummary
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
        onPress: () => {}
      },
      {
        label: Strings.MyAppointmentsScreen.joinCall,
        variant: BUTTON_VARIANT.fill,
        icon: APPOINTMENT_ACTION_ICON.video,
        // Disabled: join video call flow not built yet.
        disabled: true,
        onPress: () => {}
      }
    ];
  }

  return [
    {
      label: Strings.MyAppointmentsScreen.reschedule,
      variant: BUTTON_VARIANT.line,
      // Disabled: reschedule flow not built yet.
      disabled: true,
      onPress: () => {}
    },
    {
      label: Strings.MyAppointmentsScreen.getDirections,
      variant: BUTTON_VARIANT.fill,
      // Disabled: get directions flow not built yet.
      disabled: true,
      onPress: () => {}
    }
  ];
};

/**
 * Opens the doctor profile behind an appointment card. Module-level so the list
 * memo depends only on values, not on a handler reference.
 * @param {string} doctorId - the appointment's doctor id.
 */
const openDoctorProfile = (doctorId: string): void => {
  router.push({ pathname: STACK_ROUTES.doctorProfile, params: { id: doctorId } });
};

/**
 * State and handlers for My Appointments: tab selection, dummy data per tab,
 * and navigation to the doctor profile on card tap.
 * @returns {UseMyAppointmentsScreenReturn} tabs, list data, render helpers and handlers.
 */
export default function useMyAppointmentsScreen(): UseMyAppointmentsScreenReturn {
  const [activeTab, setActiveTab] = useState<AppointmentTab>(APPOINTMENT_TAB.upcoming);
  // Mock request state: the static data never loads or fails.
  const isLoading = false;
  const isError = false;

  const listData = useMemo<readonly AppointmentListItem[]>(() => {
    return appointmentsDummyData[activeTab].map((appointment, index) => {
      const badge = STATUS_BADGE[appointment.status];

      return {
        id: appointment.id,
        initials: appointment.initials,
        avatarTone: AVATAR_TONES[index % AVATAR_TONES.length],
        doctorName: appointment.doctorName,
        specialtyLabel: appointment.specialtyLabel,
        visitModeLabel: VISIT_MODE_LABEL[appointment.visitMode],
        badgeLabel: badge.label,
        badgeTone: badge.tone,
        date: formatDate(appointment.scheduledAt),
        time: formatTime(appointment.scheduledAt),
        actions: buildActions(appointment),
        onPress: () => openDoctorProfile(appointment.doctorId)
      };
    });
  }, [activeTab]);

  const onTabPress = useCallback((id: AppointmentTab) => {
    setActiveTab(id);
  }, []);

  // Booking needs a chosen doctor, so "+" starts at Find a doctor, the booking entry point.
  const onPressAdd = useCallback(() => {
    router.push(STACK_ROUTES.findADoctor);
  }, []);

  return {
    tabs: TABS,
    activeTab,
    listData,
    isLoading,
    isError,
    onTabPress,
    onPressAdd
  };
}
