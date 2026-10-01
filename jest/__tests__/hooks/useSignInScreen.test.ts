import { act, waitFor } from "@testing-library/react-native";
import { Alert, Linking } from "react-native";

import { AUTH_TAB, EMERGENCY_AMBULANCE_NUMBER, Strings } from "../../../src/constants";
import { signIn } from "../../../src/hooks";
import useSignInScreen from "../../../src/screens/sign-in/useSignInScreen";
import { RenderWrapperForHooks } from "../../Wrapper";

jest.mock("../../../src/hooks", () => ({
  ...jest.requireActual("../../../src/hooks"),
  signIn: jest.fn(() => Promise.resolve()),
}));

const mockedSignIn = jest.mocked(signIn);
const COPY = Strings.SignInScreen;

const renderSignIn = async () => {
  const hook = await RenderWrapperForHooks(useSignInScreen);
  // validateOnMount runs async; let it settle before asserting.
  await waitFor(() => expect(hook.result.current.isGetOtpDisabled).toBe(true));
  return hook;
};

describe("useSignInScreen", () => {
  it("starts on the mobile tab with the button disabled", async () => {
    const { result } = await renderSignIn();
    expect(result.current.activeTab).toBe(AUTH_TAB.mobile);
    expect(result.current.mobile).toBe("");
    expect(result.current.mobileError).toBeUndefined();
  });

  it("keeps digits only, capped at the country max length", async () => {
    const { result } = await renderSignIn();
    await act(async () => result.current.onMobileChange("98a76-543 21099"));
    expect(result.current.mobile).toBe("9876543210");
  });

  it("uppercases and sanitises the patient ID", async () => {
    const { result } = await renderSignIn();
    await act(async () => result.current.onPatientIdChange("cw_10 29"));
    expect(result.current.patientId).toBe("CW1029");
  });

  it("trims the mobile number when switching to a shorter country", async () => {
    const { result } = await renderSignIn();
    await act(async () => result.current.onMobileChange("9876543210"));
    await act(async () => result.current.onCountrySelect("SG"));
    expect(result.current.selectedCountry.code).toBe("SG");
    expect(result.current.mobile).toBe("98765432");
  });

  it("signs in with the placeholder token on a valid submit (dev builds)", async () => {
    const { result } = await renderSignIn();
    await act(async () => result.current.onMobileChange("9876543210"));
    await waitFor(() => expect(result.current.isGetOtpDisabled).toBe(false));

    await act(async () => result.current.onGetOtpPress());
    await waitFor(() => expect(mockedSignIn).toHaveBeenCalledTimes(1));
    expect(mockedSignIn).toHaveBeenCalledWith(expect.any(String));
    expect(result.current.mobileError).toBeUndefined();
  });

  it("does not submit an invalid form", async () => {
    const { result } = await renderSignIn();
    await act(async () => result.current.onMobileChange("12345"));
    await act(async () => result.current.onGetOtpPress());
    await waitFor(() => expect(result.current.mobileError).toBeDefined());
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  it("shows the sign-in failure under the active field and clears it on edit", async () => {
    mockedSignIn.mockRejectedValueOnce(new Error("storage"));
    const { result } = await renderSignIn();
    await act(async () => result.current.onMobileChange("9876543210"));
    await waitFor(() => expect(result.current.isGetOtpDisabled).toBe(false));

    await act(async () => result.current.onGetOtpPress());
    await waitFor(() => expect(result.current.mobileError).toBe(COPY.signInFailed));

    await act(async () => result.current.onMobileChange("9876543211"));
    expect(result.current.mobileError).toBeUndefined();
  });

  it("alerts when the emergency call cannot be started", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const openSpy = jest.spyOn(Linking, "openURL").mockRejectedValueOnce(new Error("no dialer"));
    const { result } = await renderSignIn();

    await act(async () => result.current.onEmergencyPress());
    expect(openSpy).toHaveBeenCalledWith(`tel:${EMERGENCY_AMBULANCE_NUMBER}`);
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith(COPY.callFailed));
  });
});
