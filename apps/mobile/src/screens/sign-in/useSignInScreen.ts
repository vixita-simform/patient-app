import { useFormik } from 'formik';
import { useCallback, useEffect, useRef } from 'react';
import { Alert, Linking } from 'react-native';

import type { SegmentedTabItem } from '../../components';
import type { AuthTab } from '../../constants';
import {
  AUTH_METHOD,
  AUTH_TAB,
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
  EMERGENCY_AMBULANCE_NUMBER,
  getCountryByCode,
  HTTP_STATUS,
  Strings
} from '../../constants';
import { usePatient } from '../../context';
import { signIn } from '../../hooks';
import { ApiError, signInWithPassword } from '../../services';
import type { SignInFormValues, UseSignInScreenReturn } from './SignInScreenTypes';
import { PATIENT_ID_RULES, signInSchema } from './SignInScreenValidation';

const COPY = Strings.SignInScreen;

const TABS: readonly SegmentedTabItem<AuthTab>[] = Object.freeze([
  { id: AUTH_TAB.mobile, label: COPY.tabMobileNumber },
  { id: AUTH_TAB.patientId, label: COPY.tabPatientId }
]);

const INITIAL_VALUES: SignInFormValues = Object.freeze({
  tab: AUTH_TAB.mobile,
  method: AUTH_METHOD.otp,
  countryCode: DEFAULT_COUNTRY.code,
  mobile: '',
  patientId: '',
  password: ''
});

/**
 * The username the backend expects: the mobile number with its dial code, or the patient ID.
 * @param {SignInFormValues} values - Current form values.
 * @returns {string} The username.
 */
const getUsername = ({ tab, countryCode, mobile, patientId }: SignInFormValues): string =>
  tab === AUTH_TAB.mobile ? `${getCountryByCode(countryCode).dialCode}${mobile}` : patientId;

/**
 * Picks the message to show for a failed password sign-in.
 * @param {unknown} error - What the API call threw.
 * @returns {string} Wrong credentials, or a generic failure.
 */
const getPasswordSignInError = (error: unknown): string =>
  error instanceof ApiError && error.status === HTTP_STATUS.unauthorized
    ? COPY.invalidCredentials
    : COPY.signInFailed;

/**
 * Sign in screen logic: Formik + Yup form state, input sanitising, OTP or password sign-in.
 * @returns {UseSignInScreenReturn} Form values, errors and handlers for the screen.
 */
const useSignInScreen = (): UseSignInScreenReturn => {
  const { savePatient } = usePatient();
  const formik = useFormik<SignInFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema: signInSchema,
    validateOnMount: true,
    onSubmit: async (values, { setStatus }) => {
      setStatus(undefined);
      if (values.method === AUTH_METHOD.password) {
        try {
          const { accessToken, patient } = await signInWithPassword({
            username: getUsername(values),
            password: values.password
          });
          // Save the patient first so the screens behind the route guard already have it.
          await savePatient(patient);
          // The root layout's route guard then moves to the protected screens.
          await signIn(accessToken);
        } catch (error) {
          setStatus(getPasswordSignInError(error));
        }
        return;
      }

      // There is no OTP service yet, so OTP sign-in must never create a session.
      setStatus(COPY.otpUnavailable);
    }
  });

  // Latest Formik bag in a ref, so the handlers below are stable and depend on values only.
  const formikRef = useRef(formik);
  useEffect(() => {
    formikRef.current = formik;
  });

  const selectedCountry = getCountryByCode(formik.values.countryCode);
  const isMobileTab = formik.values.tab === AUTH_TAB.mobile;
  const isPasswordMode = formik.values.method === AUTH_METHOD.password;
  // Form-level submit error, cleared on the next edit. It shows under the password field in
  // password mode, otherwise under the active tab's field.
  const submitError = typeof formik.status === 'string' ? formik.status : undefined;
  const identifierSubmitError = isPasswordMode ? undefined : submitError;
  const mobileFieldError = formik.touched.mobile ? formik.errors.mobile : undefined;
  const patientIdFieldError = formik.touched.patientId ? formik.errors.patientId : undefined;
  const passwordFieldError = formik.touched.password ? formik.errors.password : undefined;

  const onTabPress = useCallback((id: AuthTab) => {
    formikRef.current.setStatus(undefined);
    formikRef.current.setFieldValue('tab', id);
  }, []);

  const onCountrySelect = useCallback((code: string) => {
    const { values, setStatus, setValues } = formikRef.current;
    const country = getCountryByCode(code);

    setStatus(undefined);
    // One update (validated once) that also trims an already-typed number to the new max length.
    setValues({
      ...values,
      countryCode: code,
      mobile: values.mobile.slice(0, country.maxLength)
    });
  }, []);

  const onMobileChange = useCallback((text: string) => {
    const { values, setStatus, setFieldValue } = formikRef.current;
    setStatus(undefined);
    // Digits only, capped at the selected country's max length.
    setFieldValue(
      'mobile',
      text.replace(/\D/g, '').slice(0, getCountryByCode(values.countryCode).maxLength)
    );
  }, []);

  const onPatientIdChange = useCallback((text: string) => {
    formikRef.current.setStatus(undefined);
    formikRef.current.setFieldValue(
      'patientId',
      text
        .replace(/[^A-Za-z0-9-]/g, '')
        .toUpperCase()
        .slice(0, PATIENT_ID_RULES.maxLength)
    );
  }, []);

  const onMobileBlur = useCallback(() => {
    formikRef.current.setFieldTouched('mobile', true);
  }, []);

  const onPatientIdBlur = useCallback(() => {
    formikRef.current.setFieldTouched('patientId', true);
  }, []);

  const onPasswordChange = useCallback((text: string) => {
    formikRef.current.setStatus(undefined);
    formikRef.current.setFieldValue('password', text);
  }, []);

  const onPasswordBlur = useCallback(() => {
    formikRef.current.setFieldTouched('password', true);
  }, []);

  const onAuthMethodToggle = useCallback(() => {
    const { values, setStatus, setFieldTouched, setValues } = formikRef.current;
    const nextMethod =
      values.method === AUTH_METHOD.password ? AUTH_METHOD.otp : AUTH_METHOD.password;

    setStatus(undefined);
    // Never carry a typed password over to (or back from) OTP mode.
    setValues({ ...values, method: nextMethod, password: '' });
    setFieldTouched('password', false, false);
  }, []);

  const onSubmitPress = useCallback(() => {
    formikRef.current.handleSubmit();
  }, []);

  const onEmergencyPress = useCallback(() => {
    Linking.openURL(`tel:${EMERGENCY_AMBULANCE_NUMBER}`).catch(() => {
      Alert.alert(COPY.callFailed);
    });
  }, []);

  return {
    tabs: TABS,
    activeTab: formik.values.tab,
    isPasswordMode,
    countries: COUNTRY_CODES,
    selectedCountry,
    mobile: formik.values.mobile,
    patientId: formik.values.patientId,
    password: formik.values.password,
    mobileError: mobileFieldError ?? (isMobileTab ? identifierSubmitError : undefined),
    patientIdError: patientIdFieldError ?? (isMobileTab ? undefined : identifierSubmitError),
    passwordError: passwordFieldError ?? (isPasswordMode ? submitError : undefined),
    patientIdMaxLength: PATIENT_ID_RULES.maxLength,
    // Only the active tab's field (plus the password in password mode) gates submission.
    isSubmitDisabled:
      !formik.isValid ||
      formik.isSubmitting ||
      (isMobileTab ? !formik.values.mobile : !formik.values.patientId) ||
      (isPasswordMode && !formik.values.password),
    isSubmitting: formik.isSubmitting,
    onTabPress,
    onCountrySelect,
    onMobileChange,
    onPatientIdChange,
    onMobileBlur,
    onPatientIdBlur,
    onPasswordChange,
    onPasswordBlur,
    onAuthMethodToggle,
    onSubmitPress,
    onEmergencyPress
  };
};

export default useSignInScreen;
