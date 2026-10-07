import type { PatientDetail, SignInResponse } from '@patient-app/shared-types';
import { act, waitFor } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';

import {
  AUTH_TAB,
  EMERGENCY_AMBULANCE_NUMBER,
  HTTP_STATUS,
  Strings
} from '../../../../src/constants';
import { signIn } from '../../../../src/hooks';
import { setStoredPatient } from '../../../../src/utils';
import { ApiError, signInWithPassword } from '../../../../src/services';
import useSignInScreen from '../../../../src/screens/sign-in/useSignInScreen';
import { RenderWrapperForHooks } from '../../../Wrapper';

jest.mock('../../../../src/hooks', () => ({
  ...jest.requireActual('../../../../src/hooks'),
  signIn: jest.fn(() => Promise.resolve())
}));

jest.mock('../../../../src/utils', () => ({
  ...jest.requireActual('../../../../src/utils'),
  getStoredPatient: jest.fn(() => Promise.resolve(null)),
  setStoredPatient: jest.fn(() => Promise.resolve()),
  clearStoredPatient: jest.fn(() => Promise.resolve())
}));

jest.mock('../../../../src/services', () => ({
  ...jest.requireActual('../../../../src/services'),
  signInWithPassword: jest.fn()
}));

const mockedSignIn = jest.mocked(signIn);
const mockedSignInWithPassword = jest.mocked(signInWithPassword);
const PATIENT: PatientDetail = {
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
const SIGN_IN_RESPONSE: SignInResponse = {
  accessToken: 'p_001.signature',
  patient: PATIENT
};
const COPY = Strings.SignInScreen;

const renderSignIn = async () => {
  const hook = await RenderWrapperForHooks(useSignInScreen);
  // validateOnMount runs async; let it settle before asserting.
  await waitFor(() => expect(hook.result.current.isSubmitDisabled).toBe(true));
  return hook;
};

describe('useSignInScreen', () => {
  it('starts on the mobile tab with the button disabled', async () => {
    const { result } = await renderSignIn();
    expect(result.current.activeTab).toBe(AUTH_TAB.mobile);
    expect(result.current.mobile).toBe('');
    expect(result.current.mobileError).toBeUndefined();
  });

  it('keeps digits only, capped at the country max length', async () => {
    const { result } = await renderSignIn();
    await act(async () => result.current.onMobileChange('98a76-543 21099'));
    expect(result.current.mobile).toBe('9876543210');
  });

  it('uppercases and sanitises the patient ID', async () => {
    const { result } = await renderSignIn();
    await act(async () => result.current.onPatientIdChange('cw_10 29'));
    expect(result.current.patientId).toBe('CW1029');
  });

  it('trims the mobile number when switching to a shorter country', async () => {
    const { result } = await renderSignIn();
    await act(async () => result.current.onMobileChange('9876543210'));
    await act(async () => result.current.onCountrySelect('SG'));
    expect(result.current.selectedCountry.code).toBe('SG');
    expect(result.current.mobile).toBe('98765432');
  });

  it('never signs in with OTP while there is no OTP service', async () => {
    const { result } = await renderSignIn();
    await act(async () => result.current.onMobileChange('9876543210'));
    await waitFor(() => expect(result.current.isSubmitDisabled).toBe(false));

    await act(async () => result.current.onSubmitPress());
    await waitFor(() => expect(result.current.mobileError).toBe(COPY.otpUnavailable));
    expect(mockedSignIn).not.toHaveBeenCalled();

    await act(async () => result.current.onMobileChange('9876543211'));
    expect(result.current.mobileError).toBeUndefined();
  });

  it('does not submit an invalid form', async () => {
    const { result } = await renderSignIn();
    await act(async () => result.current.onMobileChange('12345'));
    await act(async () => result.current.onSubmitPress());
    await waitFor(() => expect(result.current.mobileError).toBeDefined());
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  describe('password mode', () => {
    const renderPasswordMode = async () => {
      const hook = await renderSignIn();
      await act(async () => hook.result.current.onAuthMethodToggle());
      expect(hook.result.current.isPasswordMode).toBe(true);
      return hook;
    };

    it('needs a password before it can submit', async () => {
      const { result } = await renderPasswordMode();
      await act(async () => result.current.onMobileChange('9876543210'));
      await waitFor(() => expect(result.current.isSubmitDisabled).toBe(true));

      await act(async () => result.current.onPasswordChange('Patient@123'));
      await waitFor(() => expect(result.current.isSubmitDisabled).toBe(false));
    });

    it('signs in with the mobile number and dial code as the username', async () => {
      mockedSignInWithPassword.mockResolvedValueOnce(SIGN_IN_RESPONSE);
      const { result } = await renderPasswordMode();
      await act(async () => result.current.onMobileChange('9876543210'));
      await act(async () => result.current.onPasswordChange('Patient@123'));
      await waitFor(() => expect(result.current.isSubmitDisabled).toBe(false));

      await act(async () => result.current.onSubmitPress());
      await waitFor(() => expect(mockedSignIn).toHaveBeenCalledWith(SIGN_IN_RESPONSE.accessToken));
      expect(setStoredPatient).toHaveBeenCalledWith(PATIENT);
      expect(mockedSignInWithPassword).toHaveBeenCalledWith({
        username: '+919876543210',
        password: 'Patient@123'
      });
    });

    it('signs in with the patient ID as the username', async () => {
      mockedSignInWithPassword.mockResolvedValueOnce(SIGN_IN_RESPONSE);
      const { result } = await renderPasswordMode();
      await act(async () => result.current.onTabPress(AUTH_TAB.patientId));
      await act(async () => result.current.onPatientIdChange('cw-102938'));
      await act(async () => result.current.onPasswordChange('Patient@123'));
      await waitFor(() => expect(result.current.isSubmitDisabled).toBe(false));

      await act(async () => result.current.onSubmitPress());
      await waitFor(() => expect(mockedSignIn).toHaveBeenCalledTimes(1));
      expect(mockedSignInWithPassword).toHaveBeenCalledWith({
        username: 'CW-102938',
        password: 'Patient@123'
      });
    });

    it.each([
      ['wrong credentials', new ApiError(HTTP_STATUS.unauthorized, 'x'), COPY.invalidCredentials],
      ['a network failure', new ApiError(HTTP_STATUS.networkError, 'x'), COPY.signInFailed]
    ])('shows %s under the password field', async (_name, error, message) => {
      mockedSignInWithPassword.mockRejectedValueOnce(error);
      const { result } = await renderPasswordMode();
      await act(async () => result.current.onMobileChange('9876543210'));
      await act(async () => result.current.onPasswordChange('wrong'));
      await waitFor(() => expect(result.current.isSubmitDisabled).toBe(false));

      await act(async () => result.current.onSubmitPress());
      await waitFor(() => expect(result.current.passwordError).toBe(message));
      expect(result.current.mobileError).toBeUndefined();
      expect(mockedSignIn).not.toHaveBeenCalled();

      await act(async () => result.current.onPasswordChange('wrong2'));
      expect(result.current.passwordError).toBeUndefined();
    });

    it('clears the password when switching back to OTP', async () => {
      const { result } = await renderPasswordMode();
      await act(async () => result.current.onPasswordChange('Patient@123'));
      await act(async () => result.current.onAuthMethodToggle());
      expect(result.current.isPasswordMode).toBe(false);
      expect(result.current.password).toBe('');
    });
  });

  it('alerts when the emergency call cannot be started', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const openSpy = jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no dialer'));
    const { result } = await renderSignIn();

    await act(async () => result.current.onEmergencyPress());
    expect(openSpy).toHaveBeenCalledWith(`tel:${EMERGENCY_AMBULANCE_NUMBER}`);
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith(COPY.callFailed));
  });
});
