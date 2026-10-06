import * as Yup from "yup";

import { AUTH_TAB, DEFAULT_COUNTRY, Strings, getCountryByCode } from "../../constants";
import type { AuthTab } from "../../constants";

const COPY = Strings.SignInScreen;

/** Patient ID length bounds and allowed characters. */
export const PATIENT_ID_RULES = Object.freeze({
  minLength: 4,
  maxLength: 20,
  pattern: /^[A-Za-z0-9-]+$/,
});

const DIGITS_ONLY = /^\d+$/;

/**
 * Validation for the sign-in form. Only the field of the active tab is validated, and the
 * mobile rules (length, leading digit) follow the selected country.
 */
export const signInSchema = Yup.object({
  tab: Yup.string().required(),
  countryCode: Yup.string().required(),
  mobile: Yup.string().when(["tab", "countryCode"], (values, schema) => {
    const [tab, countryCode] = values as [AuthTab, string];

    if (tab !== AUTH_TAB.mobile) {
      return schema;
    }

    const country = getCountryByCode(countryCode ?? DEFAULT_COUNTRY.code);
    const lengthLabel =
      country.minLength === country.maxLength
        ? `${country.minLength}`
        : `${country.minLength}-${country.maxLength}`;
    const lengthMessage = `${COPY.mobileLengthPrefix}${lengthLabel}${COPY.mobileLengthSuffix}`;

    return schema
      .required(COPY.mobileRequired)
      .matches(DIGITS_ONLY, COPY.mobileDigitsOnly)
      .min(country.minLength, lengthMessage)
      .max(country.maxLength, lengthMessage)
      .test("leadingDigit", COPY.mobileInvalidStart, (value) =>
        !value || !country.leadingDigits
          ? true
          : new RegExp(`^[${country.leadingDigits}]`).test(value),
      );
  }),
  patientId: Yup.string().when("tab", (values, schema) => {
    const [tab] = values as [AuthTab];

    if (tab !== AUTH_TAB.patientId) {
      return schema;
    }

    return schema
      .required(COPY.patientIdRequired)
      .min(PATIENT_ID_RULES.minLength, COPY.patientIdTooShort)
      .matches(PATIENT_ID_RULES.pattern, COPY.patientIdInvalid);
  }),
});
