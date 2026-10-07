import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';

import {
  EMERGENCY_AMBULANCE_NUMBER,
  LATEST_LAB_REPORT_ID,
  STACK_ROUTES,
  Strings
} from '../../constants';
import { usePatient } from '../../context';
import { getHomeDashboard } from '../../services';
import type { HomeDashboardResponse, PatientSummary } from '../../types';
import { formatDate, formatTime, getAuthToken, getInitials, isToday } from '../../utils';
import type { HomeViewData, HomeVital, UseHomeScreenReturn } from './HomeScreenTypes';

/** Shown blank until the stored patient is restored. */
const SIGNED_OUT_PATIENT: PatientSummary = Object.freeze({ id: '', firstName: '', lastName: '' });

/** Shown for a vital the patient has no reading for yet. */
const NO_VITAL: HomeVital = Object.freeze({ value: Strings.HomeScreen.noVital });

/** What Home shows before (or without) a dashboard: no token, appointment or readings. */
const EMPTY_DASHBOARD: Omit<HomeDashboardResponse, 'patient'> = Object.freeze({
  opdToken: null,
  nextAppointment: null,
  vitals: Object.freeze({
    heartRate: null,
    bloodPressure: null,
    bloodSugar: null,
    recordedAt: null
  })
});

/**
 * Maps the dashboard API response to the props the Home screen renders.
 * @param {HomeDashboardResponse} response - dashboard API payload.
 * @returns {HomeViewData} View data for the header, token card, appointment and vitals.
 */
export const toHomeViewData = ({
  patient,
  opdToken,
  nextAppointment,
  vitals
}: HomeDashboardResponse): HomeViewData => {
  const fullName = `${patient.firstName} ${patient.lastName}`;

  return {
    user: { initials: getInitials(fullName), name: fullName },
    token: opdToken
      ? {
          department: opdToken.department,
          tokenNumber: opdToken.tokenNumber,
          servingNumber: opdToken.nowServing,
          patientsAhead: opdToken.patientsAhead,
          waitMinutes: opdToken.estimatedWaitMinutes,
          progress: opdToken.queueProgress
        }
      : null,
    appointment: nextAppointment
      ? {
          initials: getInitials(nextAppointment.doctor.name),
          doctorName: nextAppointment.doctor.name,
          detail: `${nextAppointment.doctor.specialty}${Strings.Common.dotSeparator}${nextAppointment.room}`,
          badgeLabel: isToday(nextAppointment.scheduledAt) ? Strings.Common.today : undefined,
          date: formatDate(nextAppointment.scheduledAt),
          time: formatTime(nextAppointment.scheduledAt)
        }
      : null,
    vitals: {
      heart: vitals.heartRate
        ? { value: String(vitals.heartRate.value), unit: vitals.heartRate.unit }
        : NO_VITAL,
      // The design shows blood pressure without its unit
      bloodPressure: vitals.bloodPressure
        ? {
            value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`,
            unit: undefined
          }
        : NO_VITAL,
      sugar: vitals.bloodSugar
        ? { value: String(vitals.bloodSugar.value), unit: vitals.bloodSugar.unit }
        : NO_VITAL
    }
  };
};

/**
 * Handlers and data for the Home screen. The patient comes from the sign-in response;
 * the token, next appointment and vitals are loaded from the dashboard endpoint.
 * @returns {UseHomeScreenReturn} Screen data and press handlers.
 */
const useHomeScreen = (): UseHomeScreenReturn => {
  const { patient } = usePatient();
  const [dashboard, setDashboard] = useState<HomeDashboardResponse | null>(null);

  useEffect(() => {
    let isActive = true;
    const load = async (): Promise<void> => {
      try {
        const token = await getAuthToken();
        if (!token) {
          return;
        }
        const response = await getHomeDashboard(token);
        if (isActive) {
          setDashboard(response);
        }
      } catch {
        // Keep showing the empty state; the next visit to Home tries again.
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, []);

  const data = useMemo(
    () =>
      toHomeViewData({
        ...(dashboard ?? EMPTY_DASHBOARD),
        patient: patient ?? dashboard?.patient ?? SIGNED_OUT_PATIENT
      }),
    [dashboard, patient]
  );

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
      params: { id: LATEST_LAB_REPORT_ID }
    });
  }, []);
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
    onPressAppointment
  };
};

export default useHomeScreen;
