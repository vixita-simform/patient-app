import { useFormik } from "formik";
import { Alert, Linking } from "react-native";

import type { SegmentedTabItem } from "../../components";
import {
  AUTH_TAB,
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
  EMERGENCY_AMBULANCE_NUMBER,
  Strings,
  getCountryByCode,
} from "../../constants";
import type { AuthTab } from "../../constants";
import { signIn } from "../../hooks";
import type { SignInFormValues, UseSignInScreenReturn } from "./SignInScreenTypes";
import { PATIENT_ID_RULES, signInSchema } from "./SignInScreenValidation";

// TODO(auth): call the OTP request/verify API and sign in with the token it returns.
// Until then the placeholder token is accepted in development builds only.
const PLACEHOLDER_AUTH_TOKEN = "placeholder-token";

const COPY = Strings.SignInScreen;

const TABS: readonly SegmentedTabItem<AuthTab>[] = Object.freeze([
  { id: AUTH_TAB.mobile, label: COPY.tabMobileNumber },
  { id: AUTH_TAB.patientId, label: COPY.tabPatientId },
]);

const INITIAL_VALUES: SignInFormValues = Object.freeze({
  tab: AUTH_TAB.mobile,
  countryCode: DEFAULT_COUNTRY.code,
  mobile: "",
  patientId: "",
});

/**
 * Sign in screen logic: Formik + Yup form state, input sanitising and navigation.
 * @returns {UseSignInScreenReturn} Form values, errors and handlers for the screen.
 */
const useSignInScreen = (): UseSignInScreenReturn => {
  const formik = useFormik<SignInFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema: signInSchema,
    validateOnMount: true,
    onSubmit: async (_values, { setStatus }) => {
      setStatus(undefined);

      // No OTP check exists yet, so release builds must never sign in with the placeholder.
      if (!__DEV__) {
        setStatus(COPY.signInFailed);
        return;
      }

      try {
        // The root layout's route guard then moves to the protected screens.
        await signIn(PLACEHOLDER_AUTH_TOKEN);
      } catch {
        setStatus(COPY.signInFailed);
      }
    },
  });

  const selectedCountry = getCountryByCode(formik.values.countryCode);
  const isMobileTab = formik.values.tab === AUTH_TAB.mobile;
  // Form-level submit error, shown under the active tab's field and cleared on the next edit.
  const submitError = typeof formik.status === "string" ? formik.status : undefined;
  const mobileFieldError = formik.touched.mobile ? formik.errors.mobile : undefined;
  const patientIdFieldError = formik.touched.patientId ? formik.errors.patientId : undefined;

  const onTabPress = (id: AuthTab) => {
    formik.setStatus(undefined);
    formik.setFieldValue("tab", id);
  };

  const onCountrySelect = (code: string) => {
    const country = getCountryByCode(code);

    formik.setStatus(undefined);
    // One update (validated once) that also trims an already-typed number to the new max length.
    formik.setValues({
      ...formik.values,
      countryCode: code,
      mobile: formik.values.mobile.slice(0, country.maxLength),
    });
  };

  const onMobileChange = (text: string) => {
    formik.setStatus(undefined);
    // Digits only, capped at the selected country's max length.
    formik.setFieldValue("mobile", text.replace(/\D/g, "").slice(0, selectedCountry.maxLength));
  };

  const onPatientIdChange = (text: string) => {
    formik.setStatus(undefined);
    formik.setFieldValue(
      "patientId",
      text.replace(/[^A-Za-z0-9-]/g, "").toUpperCase().slice(0, PATIENT_ID_RULES.maxLength),
    );
  };

  const onEmergencyPress = () => {
    Linking.openURL(`tel:${EMERGENCY_AMBULANCE_NUMBER}`).catch(() => {
      Alert.alert(COPY.callFailed);
    });
  };

  return {
    tabs: TABS,
    activeTab: formik.values.tab,
    countries: COUNTRY_CODES,
    selectedCountry,
    mobile: formik.values.mobile,
    patientId: formik.values.patientId,
    mobileError: mobileFieldError ?? (isMobileTab ? submitError : undefined),
    patientIdError: patientIdFieldError ?? (isMobileTab ? undefined : submitError),
    patientIdMaxLength: PATIENT_ID_RULES.maxLength,
    // Only the active tab's field gates submission (schema ignores the other one).
    isGetOtpDisabled:
      !formik.isValid ||
      formik.isSubmitting ||
      (isMobileTab ? !formik.values.mobile : !formik.values.patientId),
    onTabPress,
    onCountrySelect,
    onMobileChange,
    onPatientIdChange,
    onMobileBlur: () => {
      formik.setFieldTouched("mobile", true);
    },
    onPatientIdBlur: () => {
      formik.setFieldTouched("patientId", true);
    },
    onGetOtpPress: () => {
      formik.handleSubmit();
    },
    onEmergencyPress,
  };
};

export default useSignInScreen;
