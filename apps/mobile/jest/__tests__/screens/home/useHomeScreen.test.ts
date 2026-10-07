import type { PatientDetail } from '@patient-app/shared-types';
import { act, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Linking } from 'react-native';

import {
  EMERGENCY_AMBULANCE_NUMBER,
  LATEST_LAB_REPORT_ID,
  STACK_ROUTES,
  Strings
} from '../../../../src/constants';
import useHomeScreen, { toHomeViewData } from '../../../../src/screens/home/useHomeScreen';
import type { HomeDashboardResponse } from '../../../../src/types';
import { getHomeDashboard } from '../../../../src/services';
import { formatDate, formatTime } from '../../../../src/utils';
import { homeDashboardFixture } from '../../../fixtures/homeDashboard';
import { RenderWrapperForHooks } from '../../../Wrapper';

const mockPatient: PatientDetail = {
  id: 'p_001',
  uhid: 'CW-2024-08813',
  firstName: 'Aarav',
  lastName: 'Sharma',
  phone: '+919876543210',
  email: 'aarav.sharma@example.com',
  gender: 'male',
  bloodGroup: 'B+',
  dateOfBirth: null,
  weight: null
};

jest.mock('../../../../src/utils', () => ({
  ...jest.requireActual('../../../../src/utils'),
  getStoredPatient: jest.fn(() => Promise.resolve(mockPatient)),
  getAuthToken: jest.fn(() => Promise.resolve('token'))
}));

jest.mock('../../../../src/services', () => ({
  ...jest.requireActual('../../../../src/services'),
  getHomeDashboard: jest.fn()
}));

const mockedGetHomeDashboard = jest.mocked(getHomeDashboard);

const withAppointmentAt = (scheduledAt: string): HomeDashboardResponse => ({
  ...homeDashboardFixture,
  nextAppointment: {
    id: 'apt_1',
    doctor: { id: 'doc_1', name: 'Dr. Rohan Mehta', specialty: 'Cardiologist' },
    room: 'Room 204',
    scheduledAt
  }
});

describe('toHomeViewData', () => {
  it('maps the patient and token', () => {
    const view = toHomeViewData(homeDashboardFixture);
    expect(view.user).toEqual({ initials: 'AS', name: 'Aarav Sharma' });
    expect(view.token).toEqual({
      department: 'Cardiology',
      tokenNumber: 'A-24',
      servingNumber: 'A-18',
      patientsAhead: 6,
      waitMinutes: 25,
      progress: 0.72
    });
  });

  it('returns a null appointment when there is none', () => {
    expect(
      toHomeViewData({ ...homeDashboardFixture, nextAppointment: null }).appointment
    ).toBeNull();
  });

  it('adds the Today badge when the appointment is today', () => {
    const now = new Date();
    now.setHours(11, 30, 0, 0);
    const scheduledAt = now.toISOString();
    expect(toHomeViewData(withAppointmentAt(scheduledAt)).appointment).toEqual({
      initials: 'RM',
      doctorName: 'Dr. Rohan Mehta',
      detail: 'Cardiologist · Room 204',
      badgeLabel: Strings.Common.today,
      date: formatDate(scheduledAt),
      time: '11:30 AM'
    });
  });

  it('omits the badge when the appointment is not today', () => {
    const appointment = toHomeViewData(withAppointmentAt('2020-01-07T09:05:00')).appointment;
    expect(appointment?.badgeLabel).toBeUndefined();
    expect(appointment?.date).toBe('Tue, 7 Jan');
    expect(appointment?.time).toBe(formatTime('2020-01-07T09:05:00'));
  });

  it('formats blood pressure as systolic/diastolic without a unit', () => {
    const { vitals } = toHomeViewData(homeDashboardFixture);
    expect(vitals.bloodPressure).toEqual({ value: '122/80', unit: undefined });
    expect(vitals.heart).toEqual({ value: '78', unit: 'bpm' });
    expect(vitals.sugar).toEqual({ value: '96', unit: 'mg/dL' });
  });
});

describe('useHomeScreen', () => {
  afterEach(() => jest.restoreAllMocks());

  it('calls the ambulance number', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { result } = await RenderWrapperForHooks(() => useHomeScreen());
    await act(async () => result.current.onPressCallAmbulance());
    expect(openURL).toHaveBeenCalledWith(`tel:${EMERGENCY_AMBULANCE_NUMBER}`);
    expect(openURL).toHaveBeenCalledWith('tel:108');
  });

  it('swallows a dialer failure', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no dialer'));
    const { result } = await RenderWrapperForHooks(() => useHomeScreen());
    await expect(act(async () => result.current.onPressCallAmbulance())).resolves.not.toThrow();
  });

  it('pushes Find a doctor from Book visit', async () => {
    const { result } = await RenderWrapperForHooks(() => useHomeScreen());
    result.current.onPressBookVisit();
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.findADoctor);
  });

  it('pushes Notifications from the bell', async () => {
    const { result } = await RenderWrapperForHooks(() => useHomeScreen());
    result.current.onPressBell();
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.notifications);
  });

  it('pushes the latest lab report detail from Lab reports', async () => {
    const { result } = await RenderWrapperForHooks(() => useHomeScreen());
    result.current.onPressLabReports();
    expect(router.push).toHaveBeenCalledWith({
      pathname: STACK_ROUTES.labReportDetail,
      params: { id: LATEST_LAB_REPORT_ID }
    });
  });

  it('pushes Medicines from the medicines shortcut', async () => {
    const { result } = await RenderWrapperForHooks(() => useHomeScreen());
    result.current.onPressMedicines();
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.medicines);
  });

  it('pushes My appointments from See all', async () => {
    const { result } = await RenderWrapperForHooks(() => useHomeScreen());
    result.current.onPressSeeAll();
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.myAppointments);
  });

  it('shows the signed-in patient with an empty dashboard until it loads', async () => {
    mockedGetHomeDashboard.mockReturnValue(new Promise(() => {}));
    const { result } = await RenderWrapperForHooks(() => useHomeScreen());
    await waitFor(() => expect(result.current.data.user.name).toBe('Aarav Sharma'));
    expect(result.current.data.token).toBeNull();
    expect(result.current.data.appointment).toBeNull();
  });

  it('loads the dashboard with the stored access token', async () => {
    mockedGetHomeDashboard.mockResolvedValue(homeDashboardFixture);
    const { result } = await RenderWrapperForHooks(() => useHomeScreen());
    await waitFor(() =>
      expect(result.current.data).toEqual(
        toHomeViewData({ ...homeDashboardFixture, patient: mockPatient })
      )
    );
    expect(mockedGetHomeDashboard).toHaveBeenCalledWith('token');
  });

  it('keeps the empty state when the dashboard request fails', async () => {
    mockedGetHomeDashboard.mockRejectedValue(new Error('offline'));
    const { result } = await RenderWrapperForHooks(() => useHomeScreen());
    await waitFor(() => expect(mockedGetHomeDashboard).toHaveBeenCalled());
    expect(result.current.data.token).toBeNull();
    expect(result.current.data.user.name).toBe('Aarav Sharma');
  });
});
