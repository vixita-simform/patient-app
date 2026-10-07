import { AUTH_METHOD, AUTH_TAB, DEFAULT_COUNTRY, Strings } from '../../../../src/constants';
import type { SignInFormValues } from '../../../../src/screens/sign-in/SignInScreenTypes';
import { signInSchema } from '../../../../src/screens/sign-in/SignInScreenValidation';

const COPY = Strings.SignInScreen;

const values = (overrides: Partial<SignInFormValues>): SignInFormValues => ({
  tab: AUTH_TAB.mobile,
  method: AUTH_METHOD.otp,
  countryCode: DEFAULT_COUNTRY.code,
  mobile: '',
  patientId: '',
  password: '',
  ...overrides
});

/** First validation message, or undefined when the values are valid. */
const firstError = async (input: SignInFormValues): Promise<string | undefined> => {
  try {
    await signInSchema.validate(input);
    return undefined;
  } catch (error) {
    return (error as Error).message;
  }
};

describe('signInSchema - mobile tab', () => {
  it('accepts a valid Indian number', async () => {
    expect(await firstError(values({ mobile: '9876543210' }))).toBeUndefined();
  });

  it('requires a number', async () => {
    expect(await firstError(values({ mobile: '' }))).toBe(COPY.mobileRequired);
  });

  it('rejects non-digits', async () => {
    expect(await firstError(values({ mobile: '98765abc10' }))).toBe(COPY.mobileDigitsOnly);
  });

  it.each([
    ['IN', '987654321', '10'],
    ['AE', '5012345678', '9'],
    ['SG', '8123456', '8']
  ])('enforces %s length', async (countryCode, mobile, length) => {
    expect(await firstError(values({ countryCode, mobile }))).toBe(
      `${COPY.mobileLengthPrefix}${length}${COPY.mobileLengthSuffix}`
    );
  });

  it.each([
    ['IN', '5876543210'],
    ['GB', '6123456789'],
    ['US', '1234567890']
  ])('rejects a bad leading digit for %s', async (countryCode, mobile) => {
    expect(await firstError(values({ countryCode, mobile }))).toBe(COPY.mobileInvalidStart);
  });

  it('accepts a number valid for the selected country', async () => {
    expect(await firstError(values({ countryCode: 'AE', mobile: '501234567' }))).toBeUndefined();
  });

  it('ignores the patient ID field', async () => {
    expect(await firstError(values({ mobile: '9876543210', patientId: '!' }))).toBeUndefined();
  });
});

describe('signInSchema - patient ID tab', () => {
  const patient = (patientId: string) => values({ tab: AUTH_TAB.patientId, patientId });

  it('accepts a valid ID', async () => {
    expect(await firstError(patient('CW-102938'))).toBeUndefined();
  });

  it('requires an ID', async () => {
    expect(await firstError(patient(''))).toBe(COPY.patientIdRequired);
  });

  it('enforces the minimum length', async () => {
    expect(await firstError(patient('CW1'))).toBe(COPY.patientIdTooShort);
  });

  it('rejects disallowed characters', async () => {
    expect(await firstError(patient('CW_1029'))).toBe(COPY.patientIdInvalid);
  });

  it('ignores the mobile field', async () => {
    expect(
      await firstError(values({ tab: AUTH_TAB.patientId, patientId: 'CW-1029', mobile: '1' }))
    ).toBeUndefined();
  });
});

describe('signInSchema - password', () => {
  it('ignores the password in OTP mode', async () => {
    expect(await firstError(values({ mobile: '9876543210' }))).toBeUndefined();
  });

  it('requires a password in password mode', async () => {
    expect(await firstError(values({ method: AUTH_METHOD.password, mobile: '9876543210' }))).toBe(
      COPY.passwordRequired
    );
  });

  it('accepts a password in password mode', async () => {
    expect(
      await firstError(
        values({ method: AUTH_METHOD.password, mobile: '9876543210', password: 'Patient@123' })
      )
    ).toBeUndefined();
  });
});
