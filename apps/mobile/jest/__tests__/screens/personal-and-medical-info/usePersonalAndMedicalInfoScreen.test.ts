import { act } from "@testing-library/react-native";
import { router } from "expo-router";

import { BLOOD_GROUP, GENDER, STACK_ROUTES } from "../../../../src/constants";
import usePersonalAndMedicalInfoScreen from "../../../../src/screens/personal-and-medical-info/usePersonalAndMedicalInfoScreen";
import { RenderWrapperForHooks } from "../../../Wrapper";

const renderScreenHook = () => RenderWrapperForHooks(() => usePersonalAndMedicalInfoScreen());

describe("usePersonalAndMedicalInfoScreen", () => {
  it("starts from the patient record", async () => {
    const { result } = await renderScreenHook();
    expect(result.current.fullName).toBe("Aarav Patel");
    expect(result.current.dateOfBirthLabel).toBe("14 Mar 1992");
    expect(result.current.allergies.map((allergy) => allergy.id)).toEqual(["penicillin", "peanuts"]);
    expect(result.current.isIosPickerVisible).toBe(false);
  });

  it("opens the iOS picker, then commits the date and closes it", async () => {
    const { result } = await renderScreenHook();
    expect(result.current.shouldRenderIosPicker).toBe(true);
    await act(() => result.current.onDateOfBirthPress());
    expect(result.current.isIosPickerVisible).toBe(true);
    await act(() => result.current.onIosDateChange(new Date(1990, 0, 5)));
    expect(result.current.isIosPickerVisible).toBe(false);
    expect(result.current.dateOfBirthLabel).toBe("5 Jan 1990");
  });

  it("dismissing the iOS picker keeps the date", async () => {
    const { result } = await renderScreenHook();
    await act(() => result.current.onDateOfBirthPress());
    await act(() => result.current.onDismissIosPicker());
    expect(result.current.isIosPickerVisible).toBe(false);
    expect(result.current.dateOfBirthLabel).toBe("14 Mar 1992");
  });

  it("removes an allergy by id", async () => {
    const { result } = await renderScreenHook();
    await act(() => result.current.onAllergyRemove("penicillin"));
    expect(result.current.allergies.map((allergy) => allergy.id)).toEqual(["peanuts"]);
  });

  it("returns no save, add-allergy or photo handlers until those APIs exist", async () => {
    const { result } = await renderScreenHook();
    expect(result.current.onSavePress).toBeUndefined();
    expect(result.current.onAllergyAdd).toBeUndefined();
    expect(result.current.onAvatarPress).toBeUndefined();
  });

  it("selects gender and blood group by their typed ids", async () => {
    const { result } = await renderScreenHook();
    await act(() => result.current.onGenderSelect(GENDER.female));
    await act(() => result.current.onBloodGroupSelect(BLOOD_GROUP.oNegative));
    expect(result.current.gender).toBe(GENDER.female);
    expect(result.current.bloodGroup).toBe(BLOOD_GROUP.oNegative);
  });

  it("goes back when there is history", async () => {
    jest.mocked(router.canGoBack).mockReturnValueOnce(true);
    const { result } = await renderScreenHook();
    result.current.onBackPress();
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("falls back to Home without history", async () => {
    jest.mocked(router.canGoBack).mockReturnValueOnce(false);
    const { result } = await renderScreenHook();
    result.current.onBackPress();
    expect(router.replace).toHaveBeenCalledWith(STACK_ROUTES.home);
    expect(router.back).not.toHaveBeenCalled();
  });
});
