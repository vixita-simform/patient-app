import { router, useLocalSearchParams } from "expo-router";

import { getDoctorProfileDetails, STACK_ROUTES } from "../../../../src/constants";
import useDoctorProfileScreen from "../../../../src/screens/doctor-profile/useDoctorProfileScreen";
import { scale } from "../../../../src/theme";
import { RenderWrapperForHooks } from "../../../Wrapper";

const mockedParams = jest.mocked(useLocalSearchParams);

const renderWithId = (id?: string) => {
  mockedParams.mockReturnValue(id === undefined ? {} : { id });
  return RenderWrapperForHooks(() => useDoctorProfileScreen());
};

describe("useDoctorProfileScreen", () => {
  it("looks up a known doctor", async () => {
    const { result } = await renderWithId("doc_311");
    expect(result.current.doctor?.summary.name).toBe("Dr. Sneha Kapoor");
    expect(result.current.doctor?.details).toBe(getDoctorProfileDetails("doc_311"));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it.each(["doc_missing", "constructor", "__proto__", "toString", ""])(
    "returns null for id %p",
    async (id) => {
      const { result } = await renderWithId(id);
      expect(result.current.doctor).toBeNull();
    },
  );

  it("returns null without an id", async () => {
    const { result } = await renderWithId();
    expect(result.current.doctor).toBeNull();
  });

  it("pads the footer by the base plus the bottom inset", async () => {
    const { result } = await renderWithId("doc_204");
    expect(result.current.footerInsetStyle).toEqual({ paddingBottom: scale(12) });
  });

  it("goes back when there is history", async () => {
    jest.mocked(router.canGoBack).mockReturnValueOnce(true);
    const { result } = await renderWithId("doc_204");
    result.current.onBackPress();
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("falls back to router.replace when canGoBack is false", async () => {
    jest.mocked(router.canGoBack).mockReturnValueOnce(false);
    const { result } = await renderWithId("doc_204");
    result.current.onBackPress();
    expect(router.replace).toHaveBeenCalledWith(STACK_ROUTES.findADoctor);
    expect(router.back).not.toHaveBeenCalled();
  });
});
