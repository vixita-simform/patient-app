import { act } from "@testing-library/react-native";
import { router } from "expo-router";
import { Alert } from "react-native";

import { PROFILE_MENU_ID, PROFILE_STAT_ID, STACK_ROUTES, Strings } from "../../../src/constants";
import { signOut } from "../../../src/hooks";
import useProfileScreen from "../../../src/screens/profile/useProfileScreen";
import { RenderWrapperForHooks } from "../../Wrapper";

jest.mock("../../../src/hooks", () => ({
  ...jest.requireActual("../../../src/hooks"),
  signOut: jest.fn(() => Promise.resolve()),
}));

const renderScreenHook = () => RenderWrapperForHooks(() => useProfileScreen());

describe("useProfileScreen", () => {
  it("exposes the stats and menu rows in display order", async () => {
    const { result } = await renderScreenHook();
    expect(result.current.stats.map((stat) => stat.id)).toEqual([
      PROFILE_STAT_ID.bloodGroup, PROFILE_STAT_ID.age, PROFILE_STAT_ID.weight,
    ]);
    expect(result.current.menuItems.map((item) => item.id)).toEqual(Object.values(PROFILE_MENU_ID));
  });

  it("keeps stats and menu rows referentially stable across renders", async () => {
    const { result, rerender } = await renderScreenHook();
    const { stats, menuItems } = result.current;
    await rerender({});
    expect(result.current.stats).toBe(stats);
    expect(result.current.menuItems).toBe(menuItems);
  });

  it("navigates only for the personal info row", async () => {
    const { result } = await renderScreenHook();
    Object.values(PROFILE_MENU_ID).forEach((id) => result.current.onMenuItemPress(id));
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.personalAndMedicalInfo);
  });

  it("signs out on logout", async () => {
    const { result } = await renderScreenHook();
    await act(() => result.current.onLogoutPress());
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("alerts when sign out fails", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    jest.mocked(signOut).mockRejectedValueOnce(new Error("secure store unavailable"));
    const { result } = await renderScreenHook();
    await act(async () => {
      result.current.onLogoutPress();
    });
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(Strings.ProfileScreen.logOutFailed);
    alertSpy.mockRestore();
  });
});
