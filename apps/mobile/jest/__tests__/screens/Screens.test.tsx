import type { PatientDetail } from '@patient-app/shared-types';
import { screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import {
  appointmentsDummyData,
  findADoctorDummyData,
  medicinesDummyData,
  STACK_ROUTES,
  Strings
} from '../../../src/constants';
import {
  DoctorProfileScreen,
  FindADoctorScreen,
  HomeScreen,
  MedicinesScreen,
  MyAppointmentsScreen,
  NotificationsScreen,
  PersonalAndMedicalInfoScreen,
  ProfileScreen,
  RecordsScreen,
  SignInScreen,
  VisitsScreen
} from '../../../src/screens';
import { formatCurrency, getAgeInYears, parseDateOnly } from '../../../src/utils';
import { homeDashboardFixture } from '../../fixtures/homeDashboard';
import { RenderWrapper } from '../../Wrapper';

// Names prefixed "mock" may be used inside the hoisted jest.mock factory.
const mockPatient: PatientDetail = {
  id: 'p_001',
  uhid: 'CW-2024-08813',
  firstName: 'Aarav',
  lastName: 'Sharma',
  phone: '+919876543210',
  email: 'aarav.sharma@example.com',
  gender: 'male',
  bloodGroup: 'B+',
  dateOfBirth: '1992-03-14',
  weight: 72
};

jest.mock('../../../src/utils', () => ({
  ...jest.requireActual('../../../src/utils'),
  getStoredPatient: jest.fn(() => Promise.resolve(mockPatient)),
  getAuthToken: jest.fn(() => Promise.resolve('token'))
}));

jest.mock('../../../src/services', () => ({
  ...jest.requireActual('../../../src/services'),
  getHomeDashboard: jest.fn(() =>
    Promise.resolve(jest.requireActual('../../fixtures/homeDashboard').homeDashboardFixture)
  )
}));

const mockedParams = jest.mocked(useLocalSearchParams);

describe('HomeScreen', () => {
  it('renders the dashboard', async () => {
    await RenderWrapper(<HomeScreen />);
    const { firstName, lastName } = mockPatient;
    const { bookVisit, callAmbulance, goodMorning, latestVitals, medicines, nextAppointment } =
      Strings.HomeScreen;
    expect(await screen.findByText(`${firstName} ${lastName}`)).toBeOnTheScreen();
    expect(
      await screen.findByText(homeDashboardFixture.opdToken?.tokenNumber ?? '')
    ).toBeOnTheScreen();
    [
      goodMorning,
      bookVisit,
      Strings.Common.labReports,
      medicines,
      callAmbulance,
      nextAppointment,
      latestVitals
    ].forEach((text) => expect(screen.getByText(text)).toBeOnTheScreen());
    expect(
      screen.getByText(homeDashboardFixture.nextAppointment?.doctor.name ?? '')
    ).toBeOnTheScreen();
  });

  it('opens Find a doctor from Book visit', async () => {
    const user = userEvent.setup();
    await RenderWrapper(<HomeScreen />);
    await user.press(screen.getByRole('button', { name: Strings.HomeScreen.bookVisit }));
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.findADoctor);
  });
});

describe('FindADoctorScreen', () => {
  it('renders the header, count and doctors', async () => {
    await RenderWrapper(<FindADoctorScreen />);
    expect(screen.getByText(Strings.FindADoctorScreen.title)).toBeOnTheScreen();
    expect(
      screen.getByText(
        `${findADoctorDummyData.totalAvailableToday} ${Strings.FindADoctorScreen.doctorsAvailableToday}`
      )
    ).toBeOnTheScreen();
    findADoctorDummyData.doctors.forEach(({ name }) =>
      expect(screen.getByText(name)).toBeOnTheScreen()
    );
  });

  it('filters by specialty chip and shows the empty state', async () => {
    const user = userEvent.setup();
    await RenderWrapper(<FindADoctorScreen />);
    await user.press(screen.getByRole('button', { name: Strings.FindADoctorScreen.ent }));
    expect(screen.getByText(Strings.FindADoctorScreen.emptyMessage)).toBeOnTheScreen();
  });

  it('filters by search text', async () => {
    const user = userEvent.setup();
    await RenderWrapper(<FindADoctorScreen />);
    await user.type(
      screen.getByPlaceholderText(Strings.FindADoctorScreen.searchPlaceholder),
      'sneha'
    );
    expect(screen.getByText('Dr. Sneha Kapoor')).toBeOnTheScreen();
    expect(screen.queryByText('Dr. Rohan Mehta')).not.toBeOnTheScreen();
    expect(
      screen.getByText(`1 ${Strings.FindADoctorScreen.doctorAvailableToday}`)
    ).toBeOnTheScreen();
  });
});

describe('DoctorProfileScreen', () => {
  it('renders a known doctor', async () => {
    mockedParams.mockReturnValue({ id: 'doc_204' });
    await RenderWrapper(<DoctorProfileScreen />);
    const { about, bookAppointment, consultationFee, insuranceAccepted } =
      Strings.DoctorProfileScreen;
    [
      'Dr. Rohan Mehta',
      'MBBS, MD, DM (Cardiology)',
      about,
      consultationFee,
      formatCurrency(800),
      insuranceAccepted,
      bookAppointment
    ].forEach((text) => expect(screen.getByText(text)).toBeOnTheScreen());
    expect(screen.queryByText(Strings.DoctorProfileScreen.notFound)).not.toBeOnTheScreen();
  });

  it('hides the insurance badge when not accepted', async () => {
    mockedParams.mockReturnValue({ id: 'doc_478' });
    await RenderWrapper(<DoctorProfileScreen />);
    expect(screen.getByText('Dr. Vikram Desai')).toBeOnTheScreen();
    expect(screen.queryByText(Strings.DoctorProfileScreen.insuranceAccepted)).not.toBeOnTheScreen();
  });

  it('shows the not-found text for an unknown id', async () => {
    mockedParams.mockReturnValue({ id: 'doc_missing' });
    await RenderWrapper(<DoctorProfileScreen />);
    expect(screen.getByText(Strings.DoctorProfileScreen.notFound)).toBeOnTheScreen();
    expect(screen.queryByText(Strings.DoctorProfileScreen.about)).not.toBeOnTheScreen();
  });
});

describe('ProfileScreen', () => {
  it('renders the title, stats and menu', async () => {
    await RenderWrapper(<ProfileScreen />);
    const {
      age,
      familyMembers,
      helpSupport,
      insuranceClaims,
      logOut,
      personalMedicalInfo,
      settings,
      title,
      vitalsHistory,
      weight
    } = Strings.ProfileScreen;
    expect(await screen.findByText('Aarav Sharma')).toBeOnTheScreen();
    expect(screen.getByText(mockPatient.phone)).toBeOnTheScreen();
    [
      title,
      Strings.Common.bloodGroup,
      'B+',
      age,
      `${getAgeInYears(parseDateOnly(mockPatient.dateOfBirth ?? ''))}${Strings.ProfileScreen.yrsSuffix}`,
      weight,
      '72 kg',
      personalMedicalInfo,
      insuranceClaims,
      vitalsHistory,
      helpSupport,
      logOut
    ].forEach((text) => expect(screen.getByText(text)).toBeOnTheScreen());
    // "Settings" is both the header button's label and a menu row title.
    expect(screen.getAllByRole('button', { name: settings })).toHaveLength(2);
    expect(screen.getByText(settings)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: familyMembers })).toBeDisabled();
    expect(
      screen.getByText(`${Strings.ProfileScreen.uhidPrefix}${mockPatient.uhid}`)
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: Strings.ProfileScreen.editProfile })).toBeDisabled();
    expect(screen.getByRole('button', { name: personalMedicalInfo })).toBeEnabled();
  });

  it('opens Personal & medical info from its menu row', async () => {
    const user = userEvent.setup();
    await RenderWrapper(<ProfileScreen />);
    await user.press(
      screen.getByRole('button', { name: Strings.ProfileScreen.personalMedicalInfo })
    );
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.personalAndMedicalInfo);
  });
});

describe('PersonalAndMedicalInfoScreen', () => {
  it('renders the form from the signed-in patient', async () => {
    await RenderWrapper(<PersonalAndMedicalInfoScreen />);
    const COPY = Strings.PersonalAndMedicalInfoScreen;
    [
      COPY.title,
      COPY.fullName,
      COPY.dateOfBirth,
      COPY.gender,
      Strings.Common.bloodGroup,
      COPY.allergies,
      COPY.existingConditions,
      COPY.emergencyContact,
      COPY.saveChanges
    ].forEach((text) => expect(screen.getByText(text)).toBeOnTheScreen());
    expect(await screen.findByDisplayValue('Aarav Sharma')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: COPY.dateOfBirth })).toHaveAccessibilityValue({
      text: '14 Mar 1992'
    });
    expect(screen.getByRole('button', { name: COPY.male })).toBeSelected();
    expect(screen.getByRole('button', { name: Strings.Common.bloodBPositive })).toBeSelected();
    // Nothing is shown for medical details the app has no record of.
    expect(screen.queryByText('Penicillin')).not.toBeOnTheScreen();
  });

  it('disables Save, + Add and Edit photo until those flows exist', async () => {
    await RenderWrapper(<PersonalAndMedicalInfoScreen />);
    const { addAllergy, editPhoto, saveChanges } = Strings.PersonalAndMedicalInfoScreen;
    [saveChanges, addAllergy, editPhoto].forEach((name) =>
      expect(screen.getByRole('button', { name })).toBeDisabled()
    );
  });
});

describe('RecordsScreen', () => {
  it('renders its header title', async () => {
    await RenderWrapper(<RecordsScreen />);
    expect(screen.getByText(Strings.RecordsScreen.headerTitle)).toBeOnTheScreen();
  });

  it('disables the search button until search exists', async () => {
    await RenderWrapper(<RecordsScreen />);
    expect(screen.getByRole('button', { name: Strings.RecordsScreen.search })).toBeDisabled();
  });

  it('opens Medicines from the prescriptions tile', async () => {
    const user = userEvent.setup();
    await RenderWrapper(<RecordsScreen />);
    await user.press(screen.getByRole('button', { name: Strings.RecordsScreen.prescriptions }));
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.medicines);
  });
});

describe('SignInScreen', () => {
  it('renders the mobile tab with Get OTP disabled and password sign-in available', async () => {
    await RenderWrapper(<SignInScreen />);
    expect(screen.getByText(Strings.SignInScreen.title)).toBeOnTheScreen();
    expect(screen.getByPlaceholderText(Strings.SignInScreen.mobilePlaceholder)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: Strings.SignInScreen.getOtp })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: Strings.SignInScreen.signInWithPassword })
    ).toBeEnabled();
    expect(
      screen.getByRole('link', { name: Strings.SignInScreen.emergencyCall })
    ).toBeOnTheScreen();
  });

  it('switches to the patient ID field', async () => {
    const user = userEvent.setup();
    await RenderWrapper(<SignInScreen />);
    await user.press(screen.getByText(Strings.SignInScreen.tabPatientId));
    expect(
      screen.getByPlaceholderText(Strings.SignInScreen.patientIdPlaceholder)
    ).toBeOnTheScreen();
    expect(screen.queryByText('+91')).not.toBeOnTheScreen();
  });

  it('shows the password field in password mode', async () => {
    const user = userEvent.setup();
    await RenderWrapper(<SignInScreen />);
    await user.press(screen.getByRole('button', { name: Strings.SignInScreen.signInWithPassword }));
    expect(screen.getByPlaceholderText(Strings.SignInScreen.passwordPlaceholder)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: Strings.SignInScreen.signIn })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: Strings.SignInScreen.signInWithOtp })
    ).toBeOnTheScreen();
  });
});

describe('VisitsScreen', () => {
  it('renders the Find a doctor screen without a back button', async () => {
    await RenderWrapper(<VisitsScreen />);
    expect(screen.getByText(Strings.FindADoctorScreen.title)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: Strings.Common.back })).not.toBeOnTheScreen();
    findADoctorDummyData.doctors.forEach(({ name }) =>
      expect(screen.getByText(name)).toBeOnTheScreen()
    );
  });
});

describe('MedicinesScreen', () => {
  it('renders the doses, prescription and medicine cards', async () => {
    await RenderWrapper(<MedicinesScreen />);
    const { activePrescription, todaysDoses, title } = Strings.MedicinesScreen;
    [title, todaysDoses, activePrescription].forEach((text) =>
      expect(screen.getByText(text)).toBeOnTheScreen()
    );
    medicinesDummyData.activePrescription.medicines.forEach(({ name }) =>
      expect(screen.getByText(name)).toBeOnTheScreen()
    );
    expect(screen.getByLabelText('6:00 PM, Next dose')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: Strings.MedicinesScreen.addMedicine })
    ).toBeDisabled();
  });
});

describe('MyAppointmentsScreen', () => {
  it('renders the tabs and the upcoming appointments', async () => {
    await RenderWrapper(<MyAppointmentsScreen />);
    const { completed, title, upcoming } = Strings.MyAppointmentsScreen;
    expect(screen.getByText(title)).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: upcoming })).toBeSelected();
    expect(screen.getByRole('tab', { name: completed })).not.toBeSelected();
    appointmentsDummyData.upcoming.forEach(({ doctorName }) =>
      expect(screen.getAllByText(doctorName).length).toBeGreaterThan(0)
    );
  });

  it('opens Find a doctor from the add button', async () => {
    const user = userEvent.setup();
    await RenderWrapper(<MyAppointmentsScreen />);
    await user.press(
      screen.getByRole('button', { name: Strings.MyAppointmentsScreen.addAppointment })
    );
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.findADoctor);
  });

  it('keeps each card action reachable as its own button', async () => {
    await RenderWrapper(<MyAppointmentsScreen />);
    expect(
      screen.getAllByRole('button', { name: Strings.MyAppointmentsScreen.reschedule }).length
    ).toBeGreaterThan(0);
  });
});

describe('NotificationsScreen', () => {
  it('renders the grouped notifications and marks all read', async () => {
    const user = userEvent.setup();
    await RenderWrapper(<NotificationsScreen />);
    const { markAllRead } = Strings.NotificationsScreen;
    [Strings.Common.notifications, Strings.Common.today, 'Lab report ready'].forEach((text) =>
      expect(screen.getByText(text)).toBeOnTheScreen()
    );
    const action = screen.getByRole('button', { name: markAllRead });
    expect(action).toBeEnabled();
    await user.press(action);
    expect(screen.getByRole('button', { name: markAllRead })).toBeDisabled();
  });
});
