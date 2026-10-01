import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { Linking } from "react-native";

import {
  EMERGENCY_AMBULANCE_NUMBER,
  homeScreenDummyData,
  STACK_ROUTES,
  Strings,
} from "../../constants";
import type { HomeDashboardResponse } from "../../types";
import { formatDate, formatTime, getInitials, isToday } from "../../utils";
import type { HomeViewData, UseHomeScreenReturn } from "./HomeScreenTypes";

/**
 * Maps the dashboard API response to the props the Home screen renders.
 * @param {HomeDashboardResponse} response - dashboard API payload.
 * @returns {HomeViewData} View data for the header, token card, appointment and vitals.
 */
export const toHomeViewData = ({
  patient,
  opdToken,
  nextAppointment,
  vitals,
}: HomeDashboardResponse): HomeViewData => {
  const fullName = `${patient.firstName} ${patient.lastName}`;

  return {
    user: { initials: getInitials(fullName), name: fullName },
    token: {
      department: opdToken.department,
      tokenNumber: opdToken.tokenNumber,
      servingNumber: opdToken.nowServing,
      patientsAhead: opdToken.patientsAhead,
      waitMinutes: opdToken.estimatedWaitMinutes,
      progress: opdToken.queueProgress,
    },
    appointment: nextAppointment
      ? {
          initials: getInitials(nextAppointment.doctor.name),
          doctorName: nextAppointment.doctor.name,
          detail: `${nextAppointment.doctor.specialty} · ${nextAppointment.room}`,
          badgeLabel: isToday(nextAppointment.scheduledAt)
            ? Strings.HomeScreen.today
            : undefined,
          date: formatDate(nextAppointment.scheduledAt),
          time: formatTime(nextAppointment.scheduledAt),
        }
      : null,
    vitals: {
      heart: {
        value: String(vitals.heartRate.value),
        unit: vitals.heartRate.unit,
      },
      // The design shows blood pressure without its unit
      bloodPressure: {
        value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`,
        unit: undefined,
      },
      sugar: {
        value: String(vitals.bloodSugar.value),
        unit: vitals.bloodSugar.unit,
      },
    },
  };
};

/**
 * Handlers and data for the Home screen. Data comes from the dummy dashboard
 * response until the API is wired up.
 * @returns {UseHomeScreenReturn} Screen data and press handlers.
 */
const useHomeScreen = (): UseHomeScreenReturn => {
  const data = useMemo(() => toHomeViewData(homeScreenDummyData), []);

  const onPressBookVisit = useCallback(() => {
    router.push(STACK_ROUTES.findADoctor);
  }, []);

  const onPressCallAmbulance = useCallback(() => {
    Linking.openURL(`tel:${EMERGENCY_AMBULANCE_NUMBER}`).catch(() => {
      // Dialer unavailable (e.g. simulator or tablet); nothing else to fall back to
    });
  }, []);

  const onPressBell = useCallback(() => {
    router.push(STACK_ROUTES.notifications);
  }, []);
  const onPressLabReports = useCallback(() => {
    router.push({
      pathname: STACK_ROUTES.labReportDetail,
      params: { id: "rec_cbc" },
    });
  }, []);
  // TODO: medicines screen not built yet
  const onPressMedicines = useCallback(() => {
    router.push(STACK_ROUTES.medicines);
  }, []);
  const onPressSeeAll = useCallback(() => {
    router.push(STACK_ROUTES.myAppointments);
  }, []);
  // TODO: vitals history screen not built yet
  const onPressHistory = useCallback(() => {}, []);
  // TODO: appointment detail screen not built yet
  const onPressAppointment = useCallback(() => {}, []);

  return {
    data,
    onPressBell,
    onPressBookVisit,
    onPressLabReports,
    onPressMedicines,
    onPressCallAmbulance,
    onPressSeeAll,
    onPressHistory,
    onPressAppointment,
  };
};

export default useHomeScreen;
